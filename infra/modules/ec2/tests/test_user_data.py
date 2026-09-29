"""Testes LOCAIS do fluxo Bash, sem instalar pacotes/serviços/diretórios reais."""
import json
import os
from pathlib import Path
import shlex
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "user-data.sh"
STUB = '''#!/usr/bin/python3
import json, os, sys
from pathlib import Path
name = Path(sys.argv[0]).name
with open(os.environ["BOOTSTRAP_TEST_LOG"], "a", encoding="utf-8") as log:
    log.write(json.dumps([name, *sys.argv[1:]]) + "\\n")
if name == os.environ.get("BOOTSTRAP_FAIL_COMMAND"):
    sys.exit(17)
'''


class UserDataFlowTests(unittest.TestCase):
    def run_script(self, failure=None):
        # Recusar execução se o script passar a usar comandos/operadores que
        # escapam dos stubs. Isso protege o host; ampliar teste exige revisão.
        for line in SCRIPT.read_text().splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            args = shlex.split(stripped)
            self.assertIn(args[0], {"set", "umask", "dnf", "systemctl", "install"})
            self.assertFalse(any(c in stripped for c in "|;&<>`$()"))
        with tempfile.TemporaryDirectory(prefix="prova-user-data-test-") as directory:
            root = Path(directory)
            binary = root / "bin"
            binary.mkdir()
            for command in ["dnf", "systemctl", "install"]:
                stub = binary / command
                stub.write_text(STUB)
                stub.chmod(0o700)
            log = root / "commands.jsonl"
            env = {"PATH": str(binary), "BOOTSTRAP_TEST_LOG": str(log), "LC_ALL": "C"}
            if failure:
                env["BOOTSTRAP_FAIL_COMMAND"] = failure
            result = subprocess.run(
                ["/bin/bash", str(SCRIPT)], env=env, capture_output=True, text=True, timeout=10
            )
            commands = [json.loads(line) for line in log.read_text().splitlines()]
            return result, commands

    def test_success_order_and_private_directory(self):
        result, commands = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(commands[0], ["dnf", "install", "-y", "docker"])
        self.assertEqual(commands[1], ["systemctl", "enable", "--now", "docker"])
        directories = {command[-1]: command for command in commands[2:]}
        self.assertEqual(set(directories), {"/opt/prova-reservas", "/etc/prova-reservas"})
        self.assertEqual(directories["/opt/prova-reservas"], ["install", "-d", "-o", "root", "-g", "root", "-m", "0755", "/opt/prova-reservas"])
        self.assertEqual(directories["/etc/prova-reservas"], ["install", "-d", "-o", "root", "-g", "root", "-m", "0700", "/etc/prova-reservas"])

    def test_package_failure_stops_before_service(self):
        result, commands = self.run_script("dnf")
        self.assertEqual(result.returncode, 17)
        self.assertEqual([command[0] for command in commands], ["dnf"])

    def test_service_failure_stops_before_directories(self):
        result, commands = self.run_script("systemctl")
        self.assertEqual(result.returncode, 17)
        self.assertEqual([command[0] for command in commands], ["dnf", "systemctl"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
