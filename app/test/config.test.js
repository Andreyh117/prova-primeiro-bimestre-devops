import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rootCertificates } from 'node:tls';
import test from 'node:test';
import { readDatabaseConfig, DatabaseConfigurationError } from '../src/db.js';

const env = {
  PGHOST: '127.0.0.1', PGDATABASE: 'reservas_test', PGUSER: 'reservas_test',
  PGPASSWORD: randomBytes(24).toString('hex'), PGSSL: 'false',
};

test('configuração incompleta é rejeitada antes de tentar conexão padrão', () => {
  for (const name of ['PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGSSL']) {
    assert.throws(() => readDatabaseConfig({ ...env, [name]: undefined }), (error) => {
      assert.ok(error instanceof DatabaseConfigurationError);
      assert.ok(error.message.includes(name));
      assert.equal(error.message.includes(env.PGPASSWORD), false);
      return true;
    });
  }
});

test('porta inválida e modo TLS ambíguo não viram configuração silenciosa', () => {
  for (const port of ['0', '65536', '5432x', '1.5', '']) {
    assert.throws(() => readDatabaseConfig({ ...env, PGPORT: port }), DatabaseConfigurationError);
  }
  assert.throws(() => readDatabaseConfig({ ...env, PGSSL: 'disable' }), DatabaseConfigurationError);
});

test('TLS exige CA legível e preserva verificação do certificado', () => {
  assert.throws(() => readDatabaseConfig({ ...env, PGSSL: 'true' }), DatabaseConfigurationError);
  const directory = mkdtempSync(join(tmpdir(), 'reservas-ca-test-'));
  try {
    const path = join(directory, 'ca.pem');
    assert.throws(() => readDatabaseConfig({ ...env, PGSSL: 'true', PGSSLROOTCERT: path }), DatabaseConfigurationError);
    // Certificado público do Node: testa a configuração; não simula conexão RDS.
    writeFileSync(path, rootCertificates[0]);
    const config = readDatabaseConfig({ ...env, PGSSL: 'true', PGSSLROOTCERT: path });
    assert.equal(config.ssl.rejectUnauthorized, true);
    assert.equal(config.ssl.ca.includes('-----BEGIN CERTIFICATE-----'), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
