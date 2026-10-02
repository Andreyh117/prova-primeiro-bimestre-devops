#!/usr/bin/env python3
"""Confere a entrega local sem iniciar serviços nem modificar recursos."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
FEATURE = "feat/api-reservas"
REQUIRED_FILES = (
    ".gitignore", ".env.example", "README.md", "relatorio.md",
    "docker-compose.yml", "app/Dockerfile", "app/.dockerignore",
    "app/package.json", "app/package-lock.json", "app/src/app.js",
    "app/src/db.js", "docs/diario-ia.md", "specs/requirements.md",
    "specs/design.md", "specs/tasks.md", "infra/main.tf",
    "infra/providers.tf", "infra/.terraform.lock.hcl",
    "infra/backend/main.tf", "infra/backend/.terraform.lock.hcl",
    "scripts/verify-api.py", "scripts/verify-aws.py",
    "scripts/verify-delivery.py", "infra/modules/vpc/main.tf",
    "infra/modules/security-group/main.tf", "infra/modules/ec2/main.tf",
    "infra/modules/rds/main.tf",
)
EVIDENCE_FILES = (
    "docker-build.txt", "docker-run.txt", "compose-ps.txt",
    "compose-rede-saude.txt", "compose-persistencia.txt",
    "api-local.txt", "postgres-local.txt", "terraform-validate.txt",
    "terraform-plan.txt", "backend-locking.txt", "aws-rede.txt",
    "aws-rds.txt", "aws-seguranca.txt", "terraform-outputs.txt",
    "ec2-deploy.txt", "health-aws.txt", "api-aws.txt", "rds-crud.txt",
    "terraform-destroy.txt", "aws-pos-destroy.txt", "backend-teardown.txt",
)
COMMIT_RE = re.compile(r"^[a-z][a-z0-9-]*(?:\([a-z0-9-]+\))?!?: .+")
KEY_RE = re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9_]{30,}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")


class CheckError(Exception):
    pass


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, capture_output=True,
        timeout=15, check=False,
    )
    if result.returncode:
        raise CheckError(f"git {' '.join(args)} retornou {result.returncode}")
    return result.stdout


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CheckError(message)


def files() -> str:
    missing = [name for name in REQUIRED_FILES if not (ROOT / name).is_file()]
    require(not missing, "arquivos ausentes: " + ", ".join(missing))
    empty = [name for name in EVIDENCE_FILES if not (ROOT / "evidencias" / name).is_file()
             or (ROOT / "evidencias" / name).stat().st_size == 0]
    require(not empty, "evidências ausentes/vazias: " + ", ".join(empty))
    return f"{len(REQUIRED_FILES)} arquivos e {len(EVIDENCE_FILES)} evidências presentes (conteúdo exige revisão humana)"


def identity() -> str:
    readme = (ROOT / "README.md").read_text()
    report = (ROOT / "relatorio.md").read_text()
    for name, text in (("README", readme), ("relatório", report)):
        require("Andreyh Rodrigues de Souza" in text and "6325231" in text,
                f"nome/RA ausentes do {name}")
    require("01/10/2026" in readme, "data de entrega ausente do README")
    require("prova-primeiro-bimestre-devops" in readme,
            "identificação do projeto ausente do README")
    return "nome, RA e data conferidos nos documentos locais"


def report() -> str:
    text = (ROOT / "relatorio.md").read_text()
    matches = list(re.finditer(r"^## ([1-4])\. .+$", text, re.MULTILINE))
    require([m.group(1) for m in matches] == ["1", "2", "3", "4"],
            "relatório deve ter exatamente as quatro questões em ordem")
    require("Codex" in text[:matches[0].start()], "IA não identificada no início")
    counts = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        count = sum(bool(line.strip()) for line in text[match.end():end].splitlines())
        require(count >= 10, f"questão {index + 1} tem apenas {count} linhas de conteúdo")
        counts.append(str(count))
    return "quatro respostas com " + "/".join(counts) + " linhas; revisão pessoal aprovada em T30A"


def readme_links() -> str:
    text = (ROOT / "README.md").read_text()
    prose = []
    in_fence = False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            prose.append(re.sub(r"`[^`]*`", "", line))
    targets = re.findall(r"\[[^\]]+\]\(([^)]+)\)", "\n".join(prose))
    local = []
    broken = []
    for raw in targets:
        target = raw.split()[0]
        parsed = urlsplit(target)
        if parsed.scheme or target.startswith("#"):
            continue
        path = (ROOT / unquote(parsed.path)).resolve()
        local.append(target)
        if not path.is_relative_to(ROOT) or not path.is_file():
            broken.append(target)
    require(not broken, "links locais inválidos no README: " + ", ".join(broken))
    require(len(local) >= 20, "índice do README incompleto")
    return f"{len(local)} links locais existentes; links externos exigem conferência separada"


def git_history(pre_merge: bool) -> str:
    git("show-ref", "--verify", "refs/heads/main")
    git("show-ref", "--verify", f"refs/heads/{FEATURE}")
    messages = git("log", "--format=%s", FEATURE).splitlines()
    bad = [subject for subject in messages if not COMMIT_RE.fullmatch(subject)]
    require(len(messages) >= 6, f"somente {len(messages)} commits na feature")
    require(not bad, "mensagens fora do padrão Conventional Commits: " + "; ".join(bad[:3]))
    if pre_merge:
        ahead = int(git("rev-list", "--count", f"main..{FEATURE}").strip())
        require(ahead > 0, "feature sem commits exclusivos antes do merge")
        return f"{len(messages)} commits convencionais; {ahead} exclusivos da feature; merge reservado a T32"
    feature_head = git("rev-parse", FEATURE).strip()
    ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", FEATURE, "main"],
        cwd=ROOT, capture_output=True, timeout=15, check=False,
    )
    require(ancestor.returncode == 0,
            "feature ainda não integrada à main; merge T32 pendente")
    merges = [line.split() for line in git("rev-list", "--parents", "main").splitlines()]
    require(any(len(parts) >= 3 and parts[2] == feature_head for parts in merges),
            "merge --no-ff da feature em main ainda não comprovado")
    return f"{len(messages)} commits convencionais e merge --no-ff da feature comprovados"


def tracked_secrets() -> str:
    tracked = git("ls-files", "-z").split("\0")
    forbidden = []
    signatures = []
    for name in filter(None, tracked):
        path = Path(name)
        parts = path.parts
        lower = name.lower()
        if ("node_modules" in parts or ".terraform" in parts
                or lower.endswith(".pem") or ".tfstate" in lower
                or ".tfplan" in lower or path.name in {"tfplan", "plan.out"}
                or path.name == ".env" or path.name.startswith(".env.") and not path.name.endswith(".example")
                or ".tfvars" in path.name and not path.name.endswith(".example")
                or path.name == "backend.local.hcl"):
            forbidden.append(name)
        file = ROOT / name
        if file.is_file() and file.stat().st_size <= 10_000_000 and KEY_RE.search(file.read_bytes()):
            signatures.append(name)
    require(not forbidden, "arquivos sensíveis rastreados: " + ", ".join(forbidden))
    require(not signatures, "possível chave/token em arquivo rastreado: " + ", ".join(signatures))
    for name in (".env", "infra/terraform.tfstate", "infra/infra.tfplan", "chave.pem"):
        result = subprocess.run(["git", "check-ignore", "--no-index", "-q", "--", name],
                                cwd=ROOT, timeout=15, check=False)
        require(result.returncode == 0, f".gitignore não protege {name}")
    return f"{len(list(filter(None, tracked)))} caminhos rastreados; nomes proibidos e assinaturas de chave não encontrados"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pre-merge", action="store_true",
                        help="confere o marco T31; o merge permanece para T32")
    args = parser.parse_args()
    failed = 0
    for name, action in (
        ("Arquivos e evidências", files),
        ("Identidade", identity),
        ("Relatório", report),
        ("Links locais", readme_links),
        ("Histórico Git", lambda: git_history(args.pre_merge)),
        ("Proteção de segredos", tracked_secrets),
    ):
        try:
            detail = action()
        except (CheckError, OSError, subprocess.TimeoutExpired) as exc:
            print(f"FALHOU — {name}: {exc}")
            failed += 1
        else:
            print(f"OK — {name}: {detail}")
    if failed:
        print(f"Verificação reprovada: {failed} item(ns). Nenhum recurso foi alterado.")
        return 1
    if args.pre_merge:
        print("Pré-merge T31 aprovado localmente. Merge, push, links públicos e PR continuam em etapas posteriores.")
    else:
        print("Estrutura local final aprovada. Publicação e PR exigem conferência separada.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
