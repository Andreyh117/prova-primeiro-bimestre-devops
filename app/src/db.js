import { readFileSync } from 'node:fs';
import pg from 'pg';

export class DatabaseConfigurationError extends Error {}

export function readDatabaseConfig(env = process.env) {
  function required(name) {
    const value = env[name];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new DatabaseConfigurationError(`${name} é obrigatório.`);
    }
    return value;
  }

  const host = required('PGHOST');
  const database = required('PGDATABASE');
  const user = required('PGUSER');
  const password = required('PGPASSWORD');
  const portText = env.PGPORT ?? '5432';
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new DatabaseConfigurationError('PGPORT deve ser uma porta de 1 a 65535.');
  }

  const sslMode = required('PGSSL');
  if (!['true', 'false'].includes(sslMode)) {
    throw new DatabaseConfigurationError('PGSSL deve ser true ou false.');
  }

  let ssl = false;
  if (sslMode === 'true') {
    const certificatePath = required('PGSSLROOTCERT');
    let ca;
    try {
      ca = readFileSync(certificatePath, 'utf8');
    } catch {
      throw new DatabaseConfigurationError('Não foi possível ler a CA de PGSSLROOTCERT.');
    }
    if (!ca.includes('-----BEGIN CERTIFICATE-----')) {
      throw new DatabaseConfigurationError('PGSSLROOTCERT deve conter uma CA em PEM.');
    }
    ssl = { ca, rejectUnauthorized: true };
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    query_timeout: 5000,
    application_name: 'prova-reservas',
  };
}

export function createDatabasePool(env = process.env) {
  const pool = new pg.Pool(readDatabaseConfig(env));
  // Falhas em conexões ociosas não devem expor o objeto de conexão/senha.
  pool.on('error', () => console.error('Conexão ociosa com PostgreSQL foi interrompida.'));
  return pool;
}
