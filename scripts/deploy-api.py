#!/usr/bin/env python3
"""Deploy explícito na EC2 própria: SCP, imagem verificada, TLS/RDS e systemd."""
import argparse
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import shlex
import stat
import subprocess
import sys
import tempfile
import tarfile
import uuid
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


class DeploymentError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise DeploymentError(message)


def checksum(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()



def archive_identity(path):
    # Docker 29/containerd pode expor o digest do índice em .Id. O runtime
    # clássico da EC2 usa o digest da configuração OCI; derivá-lo do tar.
    with tarfile.open(path, 'r') as archive:
        manifest_file = archive.extractfile('manifest.json')
        require(manifest_file is not None, 'Imagem deve conter manifest.json.')
        manifest = json.loads(manifest_file.read(1024 * 1024))
        require(len(manifest) == 1, 'Deploy exige uma única imagem no arquivo.')
        config_file = archive.extractfile(manifest[0]['Config'])
        require(config_file is not None, 'Configuração OCI ausente.')
        raw = config_file.read(10 * 1024 * 1024)
        config = json.loads(raw)
        require(config.get('architecture') == 'amd64' and config.get('os') == 'linux', 'Imagem deve ser linux/amd64.')
        require(config['config'].get('User') == 'node', 'Imagem deve executar como node.')
        revision = config['config'].get('Labels', {}).get('org.opencontainers.image.revision')
        return 'sha256:' + hashlib.sha256(raw).hexdigest(), revision


def private_file(path):
    path = Path(path)
    require(not path.is_symlink() and path.is_file(), 'Arquivo privado deve ser regular, sem symlink.')
    require(stat.S_IMODE(path.stat().st_mode) == 0o600, 'Arquivo privado deve ter modo 0600.')
    return path


def read_environment(path):
    path = private_file(path)
    text = path.read_bytes().decode('utf-8')
    require('\r' not in text and '\x00' not in text, 'Ambiente deve usar LF e não conter NUL.')
    values = {}
    for line in text.splitlines():
        require('=' in line, 'Cada linha do ambiente deve ter CHAVE=valor.')
        key, value = line.split('=', 1)
        require(key not in values and value, 'Ambiente possui chave repetida ou valor ausente.')
        values[key] = value
    fixed = {'PGPORT': '5432', 'PGDATABASE': 'reservas', 'PGSSL': 'true',
             'PGSSLROOTCERT': '/etc/ssl/certs/rds-ca.pem', 'PORT': '3000', 'NODE_ENV': 'production'}
    require(set(values) == set(fixed) | {'PGHOST', 'PGUSER', 'PGPASSWORD'}, 'Chaves de ambiente inesperadas/ausentes.')
    require(all(values[k] == v for k, v in fixed.items()), 'Porta/banco/TLS/CA/runtime fora do contrato AWS.')
    return values


def command(label, args, input_text=None):
    result = subprocess.run(args, input=input_text, text=True, capture_output=True)
    # Não divulgar stderr arbitrário (AWS/SSH podem incluir conta ou usuário).
    require(result.returncode == 0, f'{label} falhou (exit {result.returncode}); operação interrompida.')
    return result.stdout


def aws(label, *args):
    return json.loads(command(label, ['aws', *args, '--profile', 'default', '--region', 'us-east-1', '--output', 'json']) or '{}')


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--instance-id', required=True)
    p.add_argument('--identity-file', required=True, type=Path)
    p.add_argument('--known-hosts', required=True, type=Path)
    p.add_argument('--aws-context', required=True, type=Path, help='terraform.tfvars.json privado da conta aprovada')
    p.add_argument('--env-file', required=True, type=Path)
    p.add_argument('--ca-file', required=True, type=Path)
    p.add_argument('--image-archive', required=True, type=Path)
    p.add_argument('--image-id', required=True)
    p.add_argument('--image-sha256', required=True)
    p.add_argument('--source-commit', required=True)
    p.add_argument('--instance-connect', action='store_true', help='Renovar chave pública temporária por conexão SSH/SCP')
    return p.parse_args()


def deploy(args):
    os.umask(0o077)
    require(bool(re.fullmatch(r'i-[a-f0-9]{17}', args.instance_id)), 'ID EC2 inválido.')
    require(bool(re.fullmatch(r'sha256:[a-f0-9]{64}', args.image_id)), 'ID da imagem inválido.')
    require(bool(re.fullmatch(r'[a-f0-9]{64}', args.image_sha256)), 'Checksum inválido.')
    require(bool(re.fullmatch(r'[a-f0-9]{40}', args.source_commit)), 'Commit deve ter SHA completo.')
    private_file(args.identity_file)
    private_file(args.known_hosts)
    context = json.loads(private_file(args.aws_context).read_text())
    env = read_environment(args.env_file)
    require(checksum(args.image_archive) == args.image_sha256, 'Checksum local da imagem diferente do esperado.')
    image_id, revision = archive_identity(args.image_archive)
    require(image_id == args.image_id and revision == args.source_commit, 'Configuração OCI/commit da imagem diferente do esperado.')
    require('-----BEGIN CERTIFICATE-----' in args.ca_file.read_text(), 'CA deve ser certificado PEM público.')
    identity = aws('STS', 'sts', 'get-caller-identity')
    require(identity['Account'] == context['aws_account_id'] and ':assumed-role/voclabs/' in identity['Arn'], 'Conta/role diferente do Learner Lab aprovado.')
    instance = aws('EC2', 'ec2', 'describe-instances', '--instance-ids', args.instance_id)['Reservations'][0]['Instances'][0]
    tags = {v['Key']: v['Value'] for v in instance.get('Tags', [])}
    require(tags.get('Owner') == '6325231' and tags.get('Project') == 'prova-primeiro-bimestre-devops', 'EC2 fora do projeto aprovado.')
    require(instance['State']['Name'] == 'running' and instance['KeyName'] == 'vockey', 'EC2 deve estar running com key pair aprovado.')
    host = instance['PublicIpAddress']
    ipaddress.IPv4Address(host)
    with urlopen('https://checkip.amazonaws.com', timeout=15) as response:
        client = response.read().decode().strip()
    require(client + '/32' == context['ssh_cidr'], 'IP atual diferente do /32 aprovado; revisar acesso antes do deploy.')
    db = aws('RDS', 'rds', 'describe-db-instances', '--db-instance-identifier', 'prova-6325231-rds')['DBInstances'][0]
    require(db['DBInstanceStatus'] == 'available' and not db['PubliclyAccessible'] and db['StorageEncrypted'], 'RDS deve estar disponível, privado e encriptado.')
    require(env['PGHOST'] == db['Endpoint']['Address'] and env['PGUSER'] == context['rds_username'] and env['PGPASSWORD'] == context['rds_password'], 'Ambiente não corresponde ao RDS aprovado.')
    require(db['DBSubnetGroup']['VpcId'] == instance['VpcId'], 'EC2/RDS devem usar a mesma VPC.')
    ssh_opts = ['-i', str(args.identity_file.resolve()), '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'UserKnownHostsFile=' + str(args.known_hosts.resolve()), '-o', 'ConnectTimeout=15']
    target = 'ec2-user@' + host
    with tempfile.TemporaryDirectory(prefix='prova-deploy-') as local:
        local = Path(local)
        pub = local / 'access.pub'
        if args.instance_connect:
            pub.write_text(command('Derivação chave pública', ['ssh-keygen', '-y', '-f', str(args.identity_file)]))

        def renew():
            if args.instance_connect:
                response = aws('EC2 Instance Connect', 'ec2-instance-connect', 'send-ssh-public-key', '--instance-id', args.instance_id, '--instance-os-user', 'ec2-user', '--availability-zone', instance['Placement']['AvailabilityZone'], '--ssh-public-key', 'file://' + str(pub))
                require(response.get('Success') is True, 'Instance Connect não autorizou a chave temporária.')

        def ssh(label, remote, data=None):
            renew()
            return command(label, ['ssh', *ssh_opts, target, remote], data)

        stage = '/home/ec2-user/prova-deploy-' + uuid.uuid4().hex
        ssh('Staging', shlex.join(['install', '-d', '-m', '0700', stage]))
        files = {'image.tar': args.image_archive, 'rds-ca.pem': args.ca_file, 'api.env': args.env_file,
                 'prova-reservas-api.service': ROOT / 'deploy/prova-reservas-api.service',
                 'install-remote.sh': ROOT / 'deploy/install-remote.sh'}
        manifest = {'source_commit': args.source_commit, 'image_id': args.image_id,
                    'image_archive_sha256': args.image_sha256, 'ca_sha256': checksum(args.ca_file),
                    'unit_sha256': checksum(files['prova-reservas-api.service'])}
        for name, value in [('image-id', args.image_id), ('source-commit', args.source_commit), ('manifest.json', json.dumps(manifest, indent=2))]:
            path = local / name
            path.write_text(value + '\n')
            files[name] = path
        hashes = local / 'artifacts.sha256'
        hashes.write_text(''.join(checksum(path) + '  ' + name + '\n' for name, path in files.items() if name != 'api.env'))
        files['artifacts.sha256'] = hashes
        try:
            for name, path in files.items():
                renew()
                command('SCP ' + name, ['scp', *ssh_opts, str(path.resolve()), target + ':' + stage + '/' + name])
            result = ssh('Instalação remota', shlex.join(['sudo', '-n', 'bash', stage + '/install-remote.sh', stage]))
            print(result, end='')
            print(json.dumps({'deploy': 'concluído', 'source_commit': args.source_commit, 'image_id': args.image_id, 'image_archive_sha256': args.image_sha256, 'instance_id': args.instance_id, 'tls': 'PGSSL=true/CA/rejectUnauthorized=true'}))
        finally:
            # Somente staging exclusivo, sem containers/volumes/dados de outros projetos.
            ssh('Limpeza staging', shlex.join(['rm', '-rf', '--', stage]))


def main():
    try:
        deploy(parse_args())
    except (DeploymentError, OSError, ValueError, KeyError, tarfile.TarError) as error:
        # Exceções inesperadas de parser/arquivo não devem imprimir um valor secreto.
        print(str(error) if isinstance(error, DeploymentError) else 'Falha de configuração/arquivo; nenhum sucesso presumido.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
