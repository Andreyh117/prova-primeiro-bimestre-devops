import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const appDirectory = fileURLToPath(new URL('../', import.meta.url));
const image = readFileSync(new URL('./postgres-image.txt', import.meta.url), 'utf8').trim();
if (!/^postgres@sha256:[a-f0-9]{64}$/.test(image)) {
  throw new Error('A imagem PostgreSQL de teste precisa estar fixada por digest.');
}

const runId = randomUUID();
const container = `prova-reservas-test-${runId}`;
const password = randomBytes(32).toString('hex');
const dockerEnv = { ...process.env, POSTGRES_PASSWORD: password };
const redact = (value = '') => String(value).replaceAll(password, '[REDACTED]');
let creationAttempted = false;

function docker(args, { allowFailure = false, timeout = 30000 } = {}) {
  const result = spawnSync('docker', args, { env: dockerEnv, encoding: 'utf8', timeout });
  if (!allowFailure && (result.error || result.status !== 0)) {
    throw new Error(redact(`Docker falhou: ${result.stderr || result.error?.message || result.status}`));
  }
  return result;
}

function cleanup() {
  if (!creationAttempted) return;
  const filter = ['--filter', `label=devops.test.run=${runId}`];
  const ids = docker(['ps', '-aq', ...filter]).stdout.trim().split(/\s+/).filter(Boolean);
  for (const id of ids) {
    if (docker(['inspect', '--format', '{{.State.Paused}}', id]).stdout.trim() === 'true') {
      docker(['unpause', id]);
    }
    docker(['stop', '--time', '5', id]);
  }
  if (docker(['ps', '-aq', ...filter]).stdout.trim()) {
    throw new Error('O container exclusivo de teste ainda existe após a limpeza.');
  }
  creationAttempted = false;
  console.log('Limpeza confirmada: container de teste removido; dados temporários descartados.');
}

for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
  process.once(signal, () => {
    try { cleanup(); } catch (error) { console.error(redact(error.message)); }
    process.exit(code);
  });
}

try {
  console.log(`Imagem PostgreSQL fixada: ${image}`);
  creationAttempted = true;
  docker([
    'run', '--detach', '--rm', '--name', container,
    '--label', 'devops.project=prova-primeiro-bimestre-devops',
    '--label', `devops.test.run=${runId}`,
    '--publish', '127.0.0.1::5432',
    '--tmpfs', '/var/lib/postgresql/data:rw,size=256m',
    '--env', 'POSTGRES_PASSWORD',
    '--env', 'POSTGRES_USER=reservas_test',
    '--env', 'POSTGRES_DB=reservas_test', image,
  ], { timeout: 120000 });

  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = docker(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'reservas_test', '-d', 'reservas_test'], { allowFailure: true });
    if (result.status === 0) { ready = true; break; }
    await delay(500);
  }
  if (!ready) throw new Error('PostgreSQL de teste não ficou pronto dentro do prazo.');

  const ports = JSON.parse(docker(['inspect', '--format', '{{json .NetworkSettings.Ports}}', container]).stdout);
  const binding = ports['5432/tcp']?.[0];
  if (!binding || binding.HostIp !== '127.0.0.1') throw new Error('Porta de teste deve estar somente no loopback.');
  const version = docker(['exec', container, 'postgres', '--version']).stdout.trim();
  if (!/^postgres \(PostgreSQL\) 16\./.test(version)) throw new Error('O teste exige PostgreSQL 16.');
  console.log(`Banco real: ${version}; acesso em 127.0.0.1:${binding.HostPort}; senha não exibida.`);

  const testEnv = {
    ...process.env, PGHOST: '127.0.0.1', PGPORT: binding.HostPort,
    PGDATABASE: 'reservas_test', PGUSER: 'reservas_test', PGPASSWORD: password, PGSSL: 'false',
    DEVOPS_TEST_CONTAINER: container, DEVOPS_TEST_RUN_ID: runId,
  };
  const migration = spawnSync(process.execPath, ['src/migrate.js'], {
    cwd: appDirectory, env: testEnv, encoding: 'utf8', timeout: 15000,
  });
  process.stdout.write(redact(migration.stdout));
  process.stderr.write(redact(migration.stderr));
  if (migration.error || migration.status !== 0) throw new Error('Migração no banco real falhou.');

  const tests = readdirSync(new URL('./', import.meta.url))
    .filter((name) => name.endsWith('.test.js')).sort().map((name) => `test/${name}`);
  if (!tests.length) throw new Error('Nenhum teste encontrado.');
  const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', '--test-reporter=tap', ...tests], {
    cwd: appDirectory, env: testEnv, encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024,
  });
  process.stdout.write(redact(result.stdout));
  process.stderr.write(redact(result.stderr));
  if (result.error || result.status !== 0) throw new Error('Testes falharam; consulte os resultados acima.');
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
} finally {
  try { cleanup(); } catch (error) {
    console.error(redact(error.message));
    process.exitCode = 1;
  }
}
