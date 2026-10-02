import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock

spec = importlib.util.spec_from_file_location('verify_aws', Path(__file__).parents[1] / 'verify-aws.py')
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)


def rule(port, cidr=None, group=None):
    return {'IpProtocol': 'tcp', 'FromPort': port, 'ToPort': port,
            'IpRanges': [{'CidrIp': cidr}] if cidr else [],
            'UserIdGroupPairs': [{'GroupId': group}] if group else []}


class SecurityAndSQL(unittest.TestCase):
    def setUp(self):
        self.context = {'ssh_cidr': '192.0.2.10/32', 'api_allowed_cidrs': ['192.0.2.10/32']}
        self.ec2 = {'GroupId': 'sg-api', 'VpcId': 'vpc-own',
                    'IpPermissions': [rule(22, cidr='192.0.2.10/32'), rule(3000, cidr='192.0.2.10/32')],
                    'IpPermissionsEgress': [rule(80, cidr='0.0.0.0/0'), rule(443, cidr='0.0.0.0/0'), rule(5432, group='sg-db')]}
        self.db = {'GroupId': 'sg-db', 'VpcId': 'vpc-own',
                   'IpPermissions': [rule(5432, group='sg-api')], 'IpPermissionsEgress': []}

    def test_approved_security(self):
        verify.check_security(self.ec2, self.db, self.context)

    def test_public_database_rejected(self):
        self.db['IpPermissions'] = [rule(5432, cidr='0.0.0.0/0')]
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_additional_ipv6_source_rejected(self):
        self.ec2['IpPermissions'][0]['Ipv6Ranges'] = [{'CidrIpv6': '::/0'}]
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_additional_database_source_rejected(self):
        self.db['IpPermissions'][0]['UserIdGroupPairs'].append({'GroupId': 'sg-other'})
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_other_vpc_rejected(self):
        self.db['VpcId'] = 'vpc-other'
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_public_egress_database_rejected(self):
        self.ec2['IpPermissionsEgress'][-1] = rule(5432, cidr='0.0.0.0/0')
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_empty_api_cidrs_rejected(self):
        self.context['api_allowed_cidrs'] = []
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_all_tcp_ports_rejected(self):
        self.ec2['IpPermissions'].append({'IpProtocol': 'tcp', 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]})
        with self.assertRaises(verify.Error):
            verify.check_security(self.ec2, self.db, self.context)

    def test_sql_compares_civil_date_components(self):
        connection = Mock(host='192.0.2.20')
        verifier = verify.AWSVerifier(connection)
        expected = {'id': 8, 'cliente': verifier.marker, 'data': '29-02-2024', 'status': 'pendente'}
        connection.sql.return_value = {'rows': [{**expected, 'data': '2024-02-29'}]}
        verifier.sql_expected(expected)
        connection.sql.return_value = {'rows': [{**expected, 'data': '2024-03-01'}]}
        with self.assertRaises(verify.Error):
            verifier.sql_expected(expected)

    def test_cleanup_not_confirmed_when_rows_remain(self):
        connection = Mock(host='192.0.2.20')
        verifier = verify.AWSVerifier(connection)
        verifier.owned_ids.add(9)
        connection.sql.return_value = {'rows': [{'id': 9}]}
        with self.assertRaises(verify.Error):
            verifier.cleanup_sql()
        self.assertEqual(verifier.owned_ids, {9})
        connection.sql.assert_called_once_with(verifier.marker, cleanup=True)


if __name__ == '__main__':
    unittest.main()
