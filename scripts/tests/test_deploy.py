import importlib.util
import os
import io
import json
import hashlib
import tarfile
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deploy', Path(__file__).parents[1] / 'deploy-api.py')
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class DeployGuards(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / 'api.env'
        self.valid = ('PGHOST=db.private\nPGPORT=5432\nPGDATABASE=reservas\n'
                      'PGUSER=fixture\nPGPASSWORD=fixture-not-a-real-secret\nPGSSL=true\n'
                      'PGSSLROOTCERT=/etc/ssl/certs/rds-ca.pem\nPORT=3000\nNODE_ENV=production\n')
        self.path.write_text(self.valid)
        os.chmod(self.path, 0o600)

    def test_private_config_accepts_tls(self):
        self.assertEqual(deploy.read_environment(self.path)['PGSSL'], 'true')

    def test_public_permissions_rejected_before_read(self):
        os.chmod(self.path, 0o644)
        with self.assertRaisesRegex(deploy.DeploymentError, '0600'):
            deploy.read_environment(self.path)

    def test_symlink_rejected(self):
        link = self.path.parent / 'link'
        link.symlink_to(self.path)
        with self.assertRaisesRegex(deploy.DeploymentError, 'symlink'):
            deploy.read_environment(link)

    def test_disabled_tls_rejected(self):
        self.path.write_text(self.valid.replace('PGSSL=true', 'PGSSL=false'))
        with self.assertRaises(deploy.DeploymentError):
            deploy.read_environment(self.path)

    def test_duplicate_key_rejected_without_secret(self):
        self.path.write_text(self.valid + 'PGPASSWORD=DO_NOT_PRINT_THIS_VALUE\n')
        with self.assertRaises(deploy.DeploymentError) as result:
            deploy.read_environment(self.path)
        self.assertNotIn('DO_NOT_PRINT_THIS_VALUE', str(result.exception))

    def test_unknown_config_rejected(self):
        self.path.write_text(self.valid + 'AWS_SECRET_ACCESS_KEY=NOT_A_REAL_KEY\n')
        with self.assertRaises(deploy.DeploymentError):
            deploy.read_environment(self.path)

    def test_crlf_rejected(self):
        self.path.write_bytes(self.valid.replace('\n', '\r\n').encode())
        with self.assertRaises(deploy.DeploymentError):
            deploy.read_environment(self.path)

    def test_failed_command_does_not_expose_stderr(self):
        with self.assertRaises(deploy.DeploymentError) as result:
            deploy.command('fixture', ['python3', '-c', 'import sys; print("secret-fixture",file=sys.stderr);sys.exit(7)'])
        self.assertIn('exit 7', str(result.exception))
        self.assertNotIn('secret-fixture', str(result.exception))

    def make_archive(self, architecture='amd64'):
        path = self.path.parent / 'image.tar'
        config = json.dumps({'architecture': architecture, 'os': 'linux', 'config': {
            'User': 'node', 'Labels': {'org.opencontainers.image.revision': 'a' * 40}}}).encode()
        with tarfile.open(path, 'w') as archive:
            for name, data in [('manifest.json', b'[{"Config":"config.json"}]'), ('config.json', config)]:
                info = tarfile.TarInfo(name)
                info.size = len(data)
                archive.addfile(info, io.BytesIO(data))
        return path, config

    def test_oci_identity_uses_config_bytes(self):
        path, config = self.make_archive()
        self.assertEqual(deploy.archive_identity(path), ('sha256:' + hashlib.sha256(config).hexdigest(), 'a' * 40))

    def test_other_architecture_rejected(self):
        path, _ = self.make_archive('arm64')
        with self.assertRaisesRegex(deploy.DeploymentError, 'amd64'):
            deploy.archive_identity(path)

    def test_hash_reads_real_bytes(self):
        self.path.write_bytes(b'abc')
        self.assertEqual(deploy.checksum(self.path), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')


if __name__ == '__main__':
    unittest.main()
