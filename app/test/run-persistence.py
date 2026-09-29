#!/usr/bin/env python3
"""Fixture local exclusivo para T12; usa stdlib e recria apenas seu Compose UUID."""

from datetime import datetime
import importlib.util
import json
import os
from pathlib import Path
import secrets
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import uuid

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/verify-persistence.py"
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("verify_persistence", SCRIPT)
persist = importlib.util.module_from_spec(spec)
spec.loader.exec_module(persist)
require = persist.require


class Fixture:
    def __init__(self):
        self.project = "prova-reservas-t12-" + str(uuid.uuid4())
        self.temporary = Path(tempfile.mkdtemp(prefix="prova-reservas-persistencia-"))
        self.env_file = self.temporary / ".env"
        self.password = secrets.token_hex(32)
        with open(self.env_file, "x", opener=lambda name, flags: os.open(name, flags, 0o600)) as stream:
            stream.write("PORT=0\nPOSTGRES_DB=reservas_test\nPOSTGRES_USER=reservas_test\n"
                         + "POSTGRES_PASSWORD=" + self.password + "\n")
        self.compose = persist.Compose(self.project, self.env_file)
        self.filter = ["--filter", "label=com.docker.compose.project=" + self.project]
        self.creation_attempted = False
        self.checkpoints = []
        self.sentinel = None
        self.sentinel_verifier = None

    def command(self, args, expected=0, timeout=30):
        print("Comando: " + shlex.join(args), flush=True)
        try:
            result = subprocess.run(args, cwd=ROOT, env=self.compose.env, text=True,
                                    capture_output=True, timeout=timeout)
        except (OSError, subprocess.TimeoutExpired) as error:
            raise persist.VerificationError("Comando indisponível ou prazo excedido.") from error
        for title, content in (("stdout", result.stdout), ("stderr", result.stderr)):
            print(title + ":\n" + (content.replace(self.password, "[REDACTED]").rstrip() or "(vazio)"), flush=True)
        print(f"Exit code real: {result.returncode}", flush=True)
        require(result.returncode == expected, "Comando não retornou o exit code esperado.")
        return result.stdout.strip()

    def up(self, recreate=False):
        args = ["up", "--wait", "--wait-timeout", "60", "--timeout", "5"]
        args += ["--no-build", "--force-recreate"] if recreate else ["--build"]
        self.command(self.compose.prefix + args, timeout=180)
        self.command(self.compose.prefix + ["ps"])

    def resources(self):
        return {
            "container": self.compose.command(["docker", "ps", "-aq", *self.filter]).split(),
            "network": self.compose.command(["docker", "network", "ls", "-q", *self.filter]).split(),
            "volume": self.compose.command(["docker", "volume", "ls", "-q", *self.filter]).split(),
        }

    def verify(self, phase, checkpoint, expected=0):
        return self.command([sys.executable, str(SCRIPT), phase, "--project-name", self.project,
                             "--env-file", str(self.env_file), "--checkpoint", str(checkpoint)], expected, timeout=90)

    def sentinel_check(self):
        verifier = self.compose.verifier(self.sentinel["cliente"])
        row, _ = verifier.expect("GET", f'/reservas/{self.sentinel["id"]}', 200)
        require(row == self.sentinel, "Sentinela existente foi alterada/removida pelo verificador.")
        sql = self.compose.row(self.sentinel["id"], self.sentinel["cliente"])
        require(sql == {"id": self.sentinel["id"], "cliente": self.sentinel["cliente"],
                        "data_iso": "2024-02-29", "tipo": "date", "status": "pendente"},
                "SQL da sentinela mudou.")
        print("PASSOU: sentinela de outro marcador preservada por HTTP/SQL.", flush=True)

    def run(self):
        print("Data/hora real: " + datetime.now().astimezone().isoformat(), flush=True)
        print("Projeto novo/exclusivo: " + self.project + "; somente Docker local, sem AWS.", flush=True)
        self.command(["docker", "compose", "version"])
        self.command([sys.executable, "--version"])
        require(all(not ids for ids in self.resources().values()), "Projeto UUID já tem recursos; abortar.")
        self.creation_attempted = True
        self.up()
        initial = self.compose.snapshot()
        print("Snapshot inicial real: " + json.dumps(initial), flush=True)
        self.command(self.compose.prefix + ["exec", "-T", "db", "postgres", "--version"])
        marker = "Sentinela Compose " + str(uuid.uuid4())
        self.sentinel_verifier = self.compose.verifier(marker)
        self.sentinel, _ = self.sentinel_verifier.expect("POST", "/reservas", 201,
            {"cliente": marker, "data": "29-02-2024", "status": "pendente"})
        require(self.sentinel["id"] in self.sentinel_verifier.owned_ids, "Sentinela sem ID próprio.")
        self.sentinel_check()

        for negative in (False, True):
            print("=== Caso " + ("negativo: divergência real controlada" if negative else "positivo: persistência") + " ===", flush=True)
            checkpoint = self.temporary / ("negativo.json" if negative else "positivo.json")
            self.checkpoints.append(checkpoint)
            self.verify("prepare", checkpoint)
            data = persist.load_checkpoint(checkpoint, self.project)
            if negative:
                # Alterar exclusivamente a linha do verificador; sem modificar schema ou sentinela.
                sql = ("UPDATE public.reservas SET status='cancelada' "
                       f"WHERE id={data['id']} AND cliente='{data['marker']}' RETURNING id")
                print("Falha controlada, SQL próprio: " + sql, flush=True)
                require(self.compose.sql(sql) == str(data["id"]), "Negativo deve alterar uma linha própria.")
            self.up(recreate=True)
            output = self.verify("check", checkpoint, expected=1 if negative else 0)
            require("Snapshot depois:" in output and "SQL real:" in output, "Sem observação real pós-recriação.")
            require(not checkpoint.exists() and self.compose.count(data["marker"]) == 0,
                    "Check deve limpar somente marcador próprio e checkpoint, mesmo na falha.")
            self.sentinel_check()
            print("PASSOU: caso " + ("negativo retornou 1 esperado" if negative else "positivo retornou 0")
                  + "; marcador limpo, sentinela preservada.", flush=True)

        # Uma repetição sem recriar não deve ser aceita como prova de persistência.
        print("=== Caso negativo: containers não recriados ===", flush=True)
        checkpoint = self.temporary / "sem-recriacao.json"
        self.checkpoints.append(checkpoint)
        self.verify("prepare", checkpoint)
        saved = checkpoint.read_bytes()
        self.verify("prepare", checkpoint, expected=1)
        require(checkpoint.read_bytes() == saved, "Prepare não pode sobrescrever checkpoint existente.")
        original = persist.load_checkpoint(checkpoint, self.project)
        require(self.compose.count(original["marker"]) == 1, "Prepare repetido alterou a linha anterior.")
        print("PASSOU: checkpoint existente recusado, bytes/registro preservados.", flush=True)
        output = self.verify("check", checkpoint, expected=1)
        require("Snapshot depois:" in output and not checkpoint.exists(), "Negativo sem recriação deve verificar/limpar.")
        self.sentinel_check()

        print("=== Cancelamento: fase cleanup sem recriação ===", flush=True)
        checkpoint = self.temporary / "cancelamento.json"
        self.checkpoints.append(checkpoint)
        self.verify("prepare", checkpoint)
        data = persist.load_checkpoint(checkpoint, self.project)
        self.verify("cleanup", checkpoint)
        require(not checkpoint.exists() and self.compose.count(data["marker"]) == 0,
                "Cancelamento deve limpar somente sua reserva/checkpoint.")
        self.sentinel_check()

    def cleanup(self):
        if not self.creation_attempted:
            shutil.rmtree(self.temporary)
            return
        resources = self.resources()
        for kind, ids in resources.items():
            for resource in ids:
                field = ".Config.Labels" if kind == "container" else ".Labels"
                labels = self.compose.inspect(resource, field, kind)
                require(labels.get("com.docker.compose.project") == self.project, "Cleanup recusou recurso de outro projeto.")
                if kind == "volume":
                    require(resource == self.project + "_reservas-data"
                            and labels.get("com.docker.compose.volume") == "reservas-data",
                            "Cleanup recusou volume desconhecido.")
        if resources["volume"]:
            # Se o teste falhar, tentar limpeza por ID antes de remover recursos.
            for checkpoint in self.checkpoints:
                if checkpoint.exists():
                    self.verify("cleanup", checkpoint)
            if self.sentinel_verifier is not None:
                current = self.compose.verifier(self.sentinel_verifier.marker)
                current.owned_ids = set(self.sentinel_verifier.owned_ids)
                current.cleanup()
                require(self.compose.count(current.marker) == 0, "Sentinela própria ainda está no banco.")
            count = self.compose.sql("SELECT count(*) FROM public.reservas")
            print("SQL antes de encerrar fixture: total de linhas = " + count, flush=True)
            require(count == "0", "Não remover volume se qualquer dado permanecer.")
        self.command(self.compose.prefix + ["down", "--timeout", "5"])
        for volume in resources["volume"]:
            self.command(["docker", "volume", "rm", volume])
        remaining = self.resources()
        print("Recursos próprios depois do cleanup: " + json.dumps(remaining), flush=True)
        require(all(not ids for ids in remaining.values()), "Recursos próprios remanescentes.")
        shutil.rmtree(self.temporary)
        print("Limpeza confirmada: zero recursos UUID; env/checkpoints temporários removidos; .env/volumes do usuário preservados.", flush=True)


def main():
    fixture = Fixture()
    failed = False
    def interrupt(signum, frame):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, interrupt)
    try:
        fixture.run()
    except (persist.VerificationError, OSError, ValueError, KeyError, KeyboardInterrupt) as error:
        failed = True
        print("FALHOU: " + str(error).replace(fixture.password, "[REDACTED]"), file=sys.stderr, flush=True)
    finally:
        try:
            fixture.cleanup()
        except (persist.VerificationError, OSError, ValueError, KeyError, KeyboardInterrupt) as error:
            failed = True
            print("FALHOU no cleanup: " + str(error).replace(fixture.password, "[REDACTED]")
                  + "; preservar fixture/env/checkpoints em " + str(fixture.temporary)
                  + " para recuperação, sem remover volume com dados.", file=sys.stderr, flush=True)
    if not failed:
        print("PASSOU: T12 persistência HTTP/SQL, novos IDs, mesmo volume, dois negativos e limpeza própria.", flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
