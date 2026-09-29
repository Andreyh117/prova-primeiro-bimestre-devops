#!/usr/bin/env python3
"""CRUD/SQL/TLS e persistência na EC2/RDS existente; não aplica/destrói infraestrutura."""
import argparse
from datetime import datetime
import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
import time
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


dep = module('deploy_helpers', ROOT / 'scripts/deploy-api.py')
api = module('http_verifier', ROOT / 'scripts/verify-api.py')
Error = api.VerificationError


def require(condition, message):
    if not condition:
        raise Error(message)


def permissions(rules):
    """Forma canônica, mantendo todas as origens; origens extras falham."""
    result = []
    for rule in rules:
        sources = [('cidr', entry['CidrIp']) for entry in rule.get('IpRanges', [])]
        sources += [('ipv6', entry['CidrIpv6']) for entry in rule.get('Ipv6Ranges', [])]
        sources += [('sg', entry['GroupId']) for entry in rule.get('UserIdGroupPairs', [])]
        sources += [('prefix', entry['PrefixListId']) for entry in rule.get('PrefixListIds', [])]
        result.append((rule['IpProtocol'], rule.get('FromPort', -1), rule.get('ToPort', -1), tuple(sorted(sources))))
    return sorted(result)


def check_security(ec2_sg, rds_sg, context):
    rule = lambda port, kind, value: ('tcp', port, port, ((kind, value),))
    require(len(context['api_allowed_cidrs']) == 1 and context['api_allowed_cidrs'][0] == context['ssh_cidr'], 'Contrato requer API/SSH somente IP atual /32.')
    require(permissions(ec2_sg['IpPermissions']) == sorted([
        rule(22, 'cidr', context['ssh_cidr']),
        rule(3000, 'cidr', context['api_allowed_cidrs'][0])]), 'Ingress EC2 fora do /32 aprovado.')
    require(permissions(ec2_sg['IpPermissionsEgress']) == sorted([
        rule(80, 'cidr', '0.0.0.0/0'), rule(443, 'cidr', '0.0.0.0/0'),
        rule(5432, 'sg', rds_sg['GroupId'])]), 'Egress EC2 fora do plano aprovado.')
    require(permissions(rds_sg['IpPermissions']) == [rule(5432, 'sg', ec2_sg['GroupId'])]
            and not rds_sg['IpPermissionsEgress'], 'RDS deve aceitar5432 somente SGEC2, sem egress iniciada.')
    require(ec2_sg['VpcId'] == rds_sg['VpcId'], 'SGs precisam da mesma VPC.')


class Connection:
    def __init__(self, args):
        self.args = args
        self.context = json.loads(dep.private_file(args.aws_context).read_text())
        dep.private_file(args.identity_file)
        dep.private_file(args.known_hosts)
        self.public_key = None

    def preflight(self):
        identity = dep.aws('STS', 'sts', 'get-caller-identity')
        require(identity['Account'] == self.context['aws_account_id'] and ':assumed-role/voclabs/' in identity['Arn'], 'Conta/role diferente do Learner Lab aprovado.')
        require(self.args.instance_id.startswith('i-') and len(self.args.instance_id) == 19, 'ID EC2 inválido.')
        self.instance = dep.aws('EC2', 'ec2', 'describe-instances', '--instance-ids', self.args.instance_id)['Reservations'][0]['Instances'][0]
        tags = {entry['Key']: entry['Value'] for entry in self.instance.get('Tags', [])}
        require(tags.get('Owner') == '6325231' and tags.get('Project') == 'prova-primeiro-bimestre-devops', 'Instância fora do projeto.')
        require(self.instance['State']['Name'] == 'running' and self.instance['InstanceType'] == 't2.micro', 'EC2 deve estar running/t2.micro.')
        self.host = self.instance['PublicIpAddress']
        with urlopen('https://checkip.amazonaws.com', timeout=15) as response:
            current = response.read().decode().strip()
        require(current + '/32' == self.context['ssh_cidr'], 'IP atual diferente do /32 aprovado; revisar acesso.')
        self.db = dep.aws('RDS', 'rds', 'describe-db-instances', '--db-instance-identifier', 'prova-6325231-rds')['DBInstances'][0]
        require(self.db['DBInstanceStatus'] == 'available' and self.db['Engine'] == 'postgres' and self.db['EngineVersion'] == '16.15'
                and self.db['DBInstanceClass'] == 'db.t3.micro' and self.db['StorageEncrypted'] and not self.db['PubliclyAccessible'], 'RDS fora dos atributos aprovados.')
        require(self.db['DBSubnetGroup']['VpcId'] == self.instance['VpcId'], 'EC2/RDS precisam da mesma VPC.')
        require(len(self.instance['SecurityGroups']) == 1 and len(self.db['VpcSecurityGroups']) == 1, 'EC2/RDS precisam de um SG cada.')
        ids = [self.instance['SecurityGroups'][0]['GroupId'], self.db['VpcSecurityGroups'][0]['VpcSecurityGroupId']]
        groups = dep.aws('SG', 'ec2', 'describe-security-groups', '--group-ids', *ids)['SecurityGroups']
        by_id = {group['GroupId']: group for group in groups}
        check_security(by_id[ids[0]], by_id[ids[1]], self.context)
        subnet_ids = [item['SubnetIdentifier'] for item in self.db['DBSubnetGroup']['Subnets']]
        subnets = dep.aws('Subnets RDS', 'ec2', 'describe-subnets', '--subnet-ids', *subnet_ids)['Subnets']
        require(len(subnets) == 2 and len({item['AvailabilityZone'] for item in subnets}) == 2
                and all(not item['MapPublicIpOnLaunch'] and item['VpcId'] == self.instance['VpcId'] for item in subnets), 'RDS requer duas privadas em duas AZs.')
        print(json.dumps({'preflight': 'ok', 'instance': self.args.instance_id, 'ec2': 'running/t2.micro', 'rds': 'available/16.15/db.t3.micro/private/encrypted', 'sg': '22/3000 somente /32 aprovado;5432 somente SGEC2', 'subnets_rds': 'duas privadas/duas AZs'}, ensure_ascii=False), flush=True)
        if self.args.instance_connect:
            self.public_key = dep.command('Chave pública', ['ssh-keygen', '-y', '-f', str(self.args.identity_file)])

    def ssh(self, label, remote, data=None):
        if self.public_key:
            with tempfile.TemporaryDirectory(prefix='prova-verify-aws-') as folder:
                pub = Path(folder) / 'access.pub'
                pub.write_text(self.public_key)
                response = dep.aws('Instance Connect', 'ec2-instance-connect', 'send-ssh-public-key', '--instance-id', self.args.instance_id,
                                   '--instance-os-user', 'ec2-user', '--availability-zone', self.instance['Placement']['AvailabilityZone'], '--ssh-public-key', 'file://' + str(pub))
                require(response.get('Success') is True, 'Instance Connect não autorizou conexão.')
        return dep.command(label, ['ssh', '-i', str(self.args.identity_file.resolve()), '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes',
                                  '-o', 'StrictHostKeyChecking=yes', '-o', 'UserKnownHostsFile=' + str(self.args.known_hosts.resolve()),
                                  '-o', 'ConnectTimeout=15', 'ec2-user@' + self.host, remote], data)

    def runtime(self):
        remote = """set -e
systemctl is-active --quiet prova-reservas-api.service
sudo -n docker inspect --format '["{{.Id}}","{{.Image}}","{{.Config.User}}","{{index .Config.Labels "prova.owner"}}"]' prova-reservas-api
sudo -n docker exec prova-reservas-api id -u
sudo -n docker ps -a --format '{{.Names}}'
"""
        output = self.ssh('Runtime', remote).splitlines()
        container, image, user, owner = json.loads(output[0])
        require(user == 'node' and owner == '6325231' and output[1] == '1000' and output[2:] == ['prova-reservas-api'], 'Runtime precisa ser só API própria/UID1000, sem PostgreSQL local.')
        return {'container_id': container, 'image_id': image, 'uid': 1000}

    def sql(self, marker, cleanup=False):
        # Dados exclusivos entram como parâmetros pg; não interpolar em SQL.
        js = """import {createDatabasePool,readDatabaseConfig} from './src/db.js';
const marker=MARKER;const cleanup=CLEANUP;
const cfg=readDatabaseConfig();const expectedHost=EXPECTED_HOST;
if(cfg.host!==expectedHost || cfg.database!=='reservas' || cfg.ssl?.rejectUnauthorized!==true) throw new Error('Configuração RDS/TLS fora do contrato.');
const pool=createDatabasePool();const client=await pool.connect();
try {
 const tls=(await client.query('SELECT ssl,version,cipher FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0];
 if(tls?.ssl!==true) throw new Error('Conexão TLS não confirmada.');
 const query="SELECT id,cliente,to_char(data,'YYYY-MM-DD') AS data,status FROM public.reservas WHERE cliente=$1 ORDER BY id";
 const before=(await client.query(query,[marker])).rows;
 let removed=[];
 if(cleanup && before.length) removed=(await client.query('DELETE FROM public.reservas WHERE cliente=$1 AND id=ANY($2::int[]) RETURNING id',[marker,before.map(row=>row.id)])).rows;
 const rows=(await client.query(query,[marker])).rows;
 console.log(JSON.stringify({host:cfg.host,database:cfg.database,rejectUnauthorized:cfg.ssl.rejectUnauthorized,tls,rows,removed}));
} finally {client.release();await pool.end();}
""".replace('MARKER', json.dumps(marker)).replace('CLEANUP', 'true' if cleanup else 'false').replace('EXPECTED_HOST', json.dumps(self.db['Endpoint']['Address']))
        result = json.loads(self.ssh('SQL TLS', 'sudo -n docker exec -i prova-reservas-api node --input-type=module', js))
        require(result['host'] == self.db['Endpoint']['Address'] and result['database'] == 'reservas'
                and result['rejectUnauthorized'] is True and result['tls']['ssl'] is True, 'SQL precisa usar hostname RDS e TLS/certificado verificado.')
        print('SQL: ' + json.dumps(result, ensure_ascii=False), flush=True)
        return result


class AWSVerifier(api.Verifier):
    def __init__(self, connection):
        super().__init__('http://' + connection.host + ':3000', 10)
        self.connection = connection

    def sql_expected(self, expected=None):
        rows = self.connection.sql(self.marker)['rows']
        if expected is None:
            require(rows == [], 'SQL ainda contém marcador próprio após DELETE.')
        else:
            sql_row = {**expected, 'data': datetime.strptime(expected['data'], '%d-%m-%Y').strftime('%Y-%m-%d')}
            require(rows == [sql_row], 'Linha SQL não corresponde ao HTTP/DATE/status esperados.')

    def expect(self, method, path, status, body=None):
        result, headers = super().expect(method, path, status, body)
        if method in ('POST', 'PUT') and status in (200, 201):
            self.sql_expected(result)
        if method == 'DELETE' and status == 204:
            self.sql_expected()
        return result, headers

    def persistence(self):
        body = {'cliente': self.marker, 'data': '01-10-2026', 'status': 'confirmada'}
        row, _ = self.expect('POST', '/reservas', 201, body)
        before = self.connection.runtime()
        self.connection.ssh('Restart API', 'sudo -n systemctl restart prova-reservas-api.service')
        for attempt in range(30):
            try:
                health, _ = self.expect('GET', '/health', 200)
                if health == {'status': 'ok', 'database': 'ok'}:
                    break
            except Error:
                pass
            time.sleep(1)
        else:
            raise Error('API não ficou saudável após restart.')
        after = self.connection.runtime()
        require(before['container_id'] != after['container_id'] and before['image_id'] == after['image_id'], 'Restart precisa trocar container, preservando imagem.')
        actual, _ = self.expect('GET', '/reservas/' + str(row['id']), 200)
        require(actual == row, 'HTTP não preservou reserva após restart.')
        self.sql_expected(row)
        print('PERSISTÊNCIA: ' + json.dumps({'before': before, 'after': after, 'reservation': row}, ensure_ascii=False), flush=True)
        self.expect('DELETE', '/reservas/' + str(row['id']), 204)

    def cleanup_sql(self):
        result = self.connection.sql(self.marker, cleanup=True)
        require(result['rows'] == [], 'Limpeza SQL não confirmou ausência do marcador exclusivo.')
        self.owned_ids.clear()
        print('LIMPEZA: SQL confirmou zero linhas do marcador exclusivo; outros registros preservados.', flush=True)


def main():
    os.umask(0o077)
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--instance-id', required=True)
    p.add_argument('--aws-context', type=Path, default=ROOT / 'infra/terraform.tfvars.json')
    p.add_argument('--identity-file', type=Path, required=True)
    p.add_argument('--known-hosts', type=Path, required=True)
    p.add_argument('--instance-connect', action='store_true')
    args = p.parse_args()
    verifier = None
    failed = False
    try:
        connection = Connection(args)
        connection.preflight()
        print('RUNTIME: ' + json.dumps(connection.runtime()), flush=True)
        verifier = AWSVerifier(connection)
        verifier.sql_expected()
        verifier.run()
        verifier.persistence()
    except (Error, dep.DeploymentError, OSError, ValueError, KeyError, TypeError, IndexError, KeyboardInterrupt) as error:
        failed = True
        message = str(error) if isinstance(error, (Error, dep.DeploymentError)) else 'Configuração/comunicação interrompida; detalhes privados não exibidos.'
        print('FALHOU: ' + message, file=sys.stderr)
    finally:
        if verifier is not None:
            try:
                verifier.cleanup_sql()
            except (Error, dep.DeploymentError, OSError, ValueError, KeyError, TypeError, IndexError, KeyboardInterrupt):
                failed = True
                print('LIMPEZA NÃO CONFIRMADA. Marcador: ' + verifier.marker + '; IDs: ' + str(sorted(verifier.owned_ids)), file=sys.stderr)
    if failed:
        return 1
    print('PASSOU: CRUD HTTP/SQL TLS, segurança AWS, restart/persistência e limpeza reais.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
