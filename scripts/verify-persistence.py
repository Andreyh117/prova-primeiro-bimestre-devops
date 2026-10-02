#!/usr/bin/env python3
"""Confere Compose já iniciado em duas fases; não recria/remove containers ou volumes."""

import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import uuid

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("verify_api", ROOT / "scripts/verify-api.py")
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)
VerificationError = api.VerificationError
Verifier = api.Verifier
require = Verifier.require
COMPOSE_ENV = ("PORT", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD",
               "COMPOSE_FILE", "COMPOSE_PROJECT_NAME", "COMPOSE_PROFILES",
               "COMPOSE_ENV_FILES", "COMPOSE_DISABLE_ENV_FILE")


class Compose:
    def __init__(self, project, env_file):
        self.project = project
        self.env = {key: value for key, value in os.environ.items() if key not in COMPOSE_ENV}
        self.prefix = ["docker", "compose", "--project-name", project, "--file",
                       str(ROOT / "docker-compose.yml"), "--env-file", str(env_file)]

    def command(self, args, input_text=None):
        try:
            result = subprocess.run(args, cwd=ROOT, env=self.env, input=input_text,
                                    text=True, capture_output=True, timeout=30)
        except (OSError, subprocess.TimeoutExpired) as error:
            raise VerificationError("Docker/Compose indisponível ou prazo excedido.") from error
        require(result.returncode == 0, "Comando Docker/SQL falhou; conferir daemon, projeto e ambiente local.")
        # Não divulgar stderr/config expandida: podem conter valores do env-file.
        return result.stdout.strip()

    def run(self, args):
        return self.command(self.prefix + args)

    def inspect(self, resource, field, kind="container"):
        prefix = ["docker", "inspect"] if kind == "container" else ["docker", kind, "inspect"]
        return json.loads(self.command(prefix + ["--format", "{{json " + field + "}}", resource]))

    def snapshot(self):
        containers = {}
        for service in ("api", "db"):
            resource = self.run(["ps", "--all", "--quiet", service])
            require(bool(re.fullmatch(r"[0-9a-f]{64}", resource)), "Esperado um container por serviço.")
            labels = self.inspect(resource, ".Config.Labels")
            require(labels.get("com.docker.compose.project") == self.project
                    and labels.get("com.docker.compose.service") == service,
                    "Container não pertence ao projeto/serviço informado.")
            state = self.inspect(resource, ".State")
            require(state.get("Status") == "running" and state.get("Health", {}).get("Status") == "healthy",
                    "api/db precisam estar running/healthy antes da verificação.")
            containers[service] = resource
        mounts = self.inspect(containers["db"], ".Mounts")
        data = [mount for mount in mounts if mount["Destination"] == "/var/lib/postgresql/data"]
        require(len(data) == 1 and data[0]["Type"] == "volume", "PostgreSQL precisa de volume nomeado.")
        name = data[0]["Name"]
        labels = self.inspect(name, ".Labels", "volume")
        require(labels.get("com.docker.compose.project") == self.project
                and labels.get("com.docker.compose.volume") == "reservas-data",
                "Volume não pertence ao projeto informado.")
        return {"containers": containers, "volume": name,
                "volume_created_at": self.inspect(name, ".CreatedAt", "volume")}

    def verifier(self, marker):
        address = self.run(["port", "api", "3000"])
        require(bool(re.fullmatch(r"127\.0\.0\.1:[0-9]+", address)), "API deve estar publicada somente em loopback.")
        verifier = Verifier("http://" + address, 5.0)
        verifier.marker = marker
        return verifier

    def sql(self, query):
        # Credenciais ficam no ambiente do container; SQL via stdin, sem shell interpolation.
        args = ["exec", "-T", "db", "sh", "-c",
                'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -qAt -v ON_ERROR_STOP=1']
        return self.command(self.prefix + args, "SET statement_timeout = '5s';\n" + query + ";\n")

    def row(self, row_id, marker):
        query = ("SELECT json_build_object('id',id,'cliente',cliente,'data_iso',"
                 "to_char(data,'YYYY-MM-DD'),'tipo',pg_typeof(data)::text,'status',status)::text "
                 f"FROM public.reservas WHERE id={row_id} AND cliente='{marker}'")
        raw = self.sql(query)
        row = json.loads(raw) if raw else None
        print("SQL real: " + json.dumps(row, ensure_ascii=False), flush=True)
        return row

    def count(self, marker):
        return int(self.sql(f"SELECT count(*) FROM public.reservas WHERE cliente='{marker}'"))


def load_checkpoint(path, project):
    require(not path.is_symlink() and path.is_file(), "Checkpoint precisa ser arquivo regular existente.")
    require(path.stat().st_mode & 0o077 == 0, "Checkpoint deve ter permissão 0600.")
    data = json.loads(path.read_text())
    require(isinstance(data, dict) and data.get("version") == 1 and data.get("project") == project,
            "Checkpoint não corresponde ao projeto/versão.")
    marker = data.get("marker", "")
    require(isinstance(marker, str) and bool(re.fullmatch(r"Persistencia Compose [0-9a-f-]{36}", marker)),
            "Marcador inválido; nenhuma exclusão autorizada.")
    uuid.UUID(marker.removeprefix("Persistencia Compose "))
    row_id = data.get("id")
    require(type(row_id) is int and 0 < row_id <= 2147483647, "Checkpoint não contém ID próprio válido.")
    require(isinstance(data.get("before"), dict), "Snapshot anterior ausente.")
    return data


def cleanup(compose, verifier, path):
    verifier.cleanup()
    remaining = compose.count(verifier.marker)
    print(f"SQL limpeza: count do marcador próprio = {remaining}.", flush=True)
    require(remaining == 0, "Há linhas próprias pendentes; manter checkpoint e conferir marcador.")
    path.unlink()
    print("Checkpoint removido após confirmar limpeza própria por HTTP e SQL.", flush=True)


def execute(args):
    compose = Compose(args.project_name, args.env_file)
    path = args.checkpoint
    verifier = None
    failed = False
    prepared = False
    reserved = False
    try:
        if args.phase == "prepare":
            before = compose.snapshot()
            marker = "Persistencia Compose " + str(uuid.uuid4())
            verifier = compose.verifier(marker)
            health, _ = verifier.expect("GET", "/health", 200)
            require(health == {"status": "ok", "database": "ok"}, "Banco sem saúde confirmada.")
            # Reservar caminho sem sobrescrever checkpoint preexistente, antes de gravar no banco.
            with open(path, "x", opener=lambda name, flags: os.open(name, flags, 0o600)) as checkpoint:
                reserved = True
                data = {"version": 1, "project": args.project_name, "marker": marker, "id": None, "before": before}
                checkpoint.write(json.dumps(data) + "\n")
                checkpoint.flush()
                os.fsync(checkpoint.fileno())
                print(f"Marcador exclusivo: {marker}", flush=True)
                body = {"cliente": marker, "data": "01-10-2026", "status": "confirmada"}
                row, _ = verifier.expect("POST", "/reservas", 201, body)
                require(isinstance(row, dict) and row.get("id") in verifier.owned_ids, "POST sem ID próprio.")
                data["id"] = row["id"]
                checkpoint.seek(0)
                checkpoint.write(json.dumps(data) + "\n")
                checkpoint.truncate()
                checkpoint.flush()
                os.fsync(checkpoint.fileno())
                require(row == {"id": data["id"], **body}, "POST alterou campos/data.")
                sql = compose.row(data["id"], marker)
                require(sql == {"id": data["id"], "cliente": marker, "data_iso": "2026-10-01",
                                "tipo": "date", "status": "confirmada"}, "SQL antes diverge do POST.")
            print("Snapshot antes: " + json.dumps(before), flush=True)
            prepared = True
            print("PASSOU: prepare; linha/checkpoint mantidos para recriação externa dos containers.", flush=True)
        else:
            data = load_checkpoint(path, args.project_name)
            verifier = compose.verifier(data["marker"])
            verifier.owned_ids.add(data["id"])
            if args.phase == "check":
                after = compose.snapshot()
                print("Snapshot depois: " + json.dumps(after), flush=True)
                before = data["before"]
                require(after["volume"] == before.get("volume")
                        and after["volume_created_at"] == before.get("volume_created_at"),
                        "Volume mudou; retenção do mesmo volume não comprovada.")
                require(all(after["containers"][name] != before.get("containers", {}).get(name)
                            for name in ("api", "db")), "api/db devem ter novos IDs, não apenas restart.")
                status, row, _ = verifier.request("GET", f'/reservas/{data["id"]}')
                print(f"GET depois: HTTP {status}; " + json.dumps(row, ensure_ascii=False), flush=True)
                sql = compose.row(data["id"], data["marker"])
                require(status == 200 and row == {"id": data["id"], "cliente": data["marker"],
                                                 "data": "01-10-2026", "status": "confirmada"},
                        "Reserva por HTTP diverge do registro anterior à recriação.")
                require(sql == {"id": data["id"], "cliente": data["marker"], "data_iso": "2026-10-01",
                                "tipo": "date", "status": "confirmada"}, "Reserva SQL mudou ou desapareceu.")
                print("PASSOU: novos containers, mesmo volume e reserva idêntica por HTTP/SQL.", flush=True)
    except (VerificationError, OSError, ValueError, KeyError, KeyboardInterrupt) as error:
        failed = True
        message = str(error) if isinstance(error, VerificationError) else "Arquivo/configuração inválida ou execução interrompida."
        print("FALHOU: " + message, file=sys.stderr, flush=True)
    finally:
        if verifier is not None and not prepared:
            try:
                # Em prepare sem checkpoint exclusivo, não remover o arquivo preexistente.
                if args.phase != "prepare" or reserved:
                    cleanup(compose, verifier, path)
            except (VerificationError, OSError, ValueError, KeyboardInterrupt):
                failed = True
                print(f"FALHOU na limpeza. IDs pendentes: {sorted(verifier.owned_ids)}; marcador: {verifier.marker}; "
                      "conferir banco/checkpoint antes de retomar.", file=sys.stderr, flush=True)
    if not failed and args.phase != "prepare":
        print("PASSOU: verificação/limpeza concluída; containers e volume preservados.", flush=True)
    return 1 if failed else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("phase", choices=("prepare", "check", "cleanup"))
    parser.add_argument("--project-name", required=True, help="Mesmo nome de projeto do Compose já iniciado")
    parser.add_argument("--env-file", type=Path, required=True, help="Ambiente privado usado ao iniciar Compose")
    parser.add_argument("--checkpoint", type=Path, required=True, help="Arquivo 0600 fora do repositório")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9][a-z0-9_-]*", args.project_name):
        parser.error("project-name inválido")
    if not args.env_file.is_file():
        parser.error("env-file deve existir; seu conteúdo nunca é exibido")
    return execute(args)


if __name__ == "__main__":
    sys.exit(main())
