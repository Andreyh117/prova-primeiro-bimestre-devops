import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const composeFile = join(root, 'docker-compose.yml');
const verifyScript = join(root, 'scripts/verify-api.py');
const project = `prova-reservas-t11-${randomUUID()}`;
const network = `${project}_reservas-net`;
const volume = `${project}_reservas-data`;
const temporary = mkdtempSync(join(tmpdir(), 'prova-reservas-compose-'));
const envFile = join(temporary, '.env');
const missingEnvFile = join(temporary, '.env.missing');
const password = randomBytes(32).toString('hex');
const env = { ...process.env };
// Shell prevalece sobre env-file: retirar só variáveis que poderiam trocar este fixture.
for (const name of ['PORT', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
  'COMPOSE_FILE', 'COMPOSE_PROJECT_NAME', 'COMPOSE_PROFILES', 'COMPOSE_ENV_FILES', 'COMPOSE_DISABLE_ENV_FILE']) delete env[name];
writeFileSync(envFile, `PORT=0\nPOSTGRES_DB=reservas_test\nPOSTGRES_USER=reservas_test\nPOSTGRES_PASSWORD=${password}\n`, { mode: 0o600, flag: 'wx' });
writeFileSync(missingEnvFile, 'PORT=0\nPOSTGRES_DB=reservas_test\nPOSTGRES_USER=reservas_test\n', { mode: 0o600, flag: 'wx' });
const filter = ['--filter', `label=com.docker.compose.project=${project}`];
let creationAttempted = false;
const redact = (value = '') => String(value).replaceAll(password, '[REDACTED]');
const quote = (value) => "'" + value.replaceAll("'", "'\"'\"'") + "'";

function command(program, args, { log = true, expectedExit = 0, timeout = 30000 } = {}) {
  if (log) console.log(`Comando: ${program} ${args.map(quote).join(' ')}`);
  const result = spawnSync(program, args, { cwd: root, env, encoding: 'utf8', timeout, maxBuffer: 4 * 1024 * 1024 });
  if (log) {
    console.log(`stdout:\n${redact(result.stdout) || '(vazio)'}`);
    console.log(`stderr:\n${redact(result.stderr) || '(vazio)'}`);
    console.log(`Exit code real: ${result.status}`);
  }
  assert.equal(result.error, undefined, `${program} deve executar dentro do prazo.`);
  assert.equal(result.status, expectedExit, redact(`${program} falhou: ${result.stderr}`));
  return result.stdout.trim();
}

const docker = (args, options) => command('docker', args, options);
const compose = (args, options) => docker(['compose', '--project-name', project, '--file', composeFile, '--env-file', envFile, ...args], options);
const ids = () => docker(['ps', '-aq', ...filter], { log: false }).split(/\s+/).filter(Boolean);
const inspect = (id, field) => JSON.parse(docker(['inspect', '--format', `{{json ${field}}}`, id], { log: false }));

function assertOwner(kind, id) {
  const args = kind === 'container' ? ['inspect', '--format', '{{json .Config.Labels}}', id]
    : [kind, 'inspect', '--format', '{{json .Labels}}', id];
  const labels = JSON.parse(docker(args, { log: false }));
  assert.equal(labels['com.docker.compose.project'], project, 'Recurso deve pertencer ao fixture exclusivo.');
  return labels;
}

function cleanup() {
  try {
    if (creationAttempted) {
      for (const id of ids()) assertOwner('container', id);
      const networks = docker(['network', 'ls', '-q', ...filter], { log: false }).split(/\s+/).filter(Boolean);
      for (const id of networks) assertOwner('network', id);
      const volumes = docker(['volume', 'ls', '-q', ...filter], { log: false }).split(/\s+/).filter(Boolean);
      for (const id of volumes) {
        assert.equal(id, volume, 'Nunca remover volumes de outros projetos.');
        assert.equal(assertOwner('volume', id)['com.docker.compose.volume'], 'reservas-data');
      }
      // Não usar down -v. Volume novo/exclusivo é removido separadamente após conferir labels.
      compose(['down', '--timeout', '5']);
      for (const id of volumes) docker(['volume', 'rm', id]);
      assert.deepEqual(ids(), []);
      assert.equal(docker(['network', 'ls', '-q', ...filter], { log: false }), '');
      assert.equal(docker(['volume', 'ls', '-q', ...filter], { log: false }), '');
      console.log('Limpeza confirmada: zero containers/redes/volumes do projeto UUID; volumes de outros projetos preservados.');
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
    console.log('Arquivo de ambiente temporário removido; .env do usuário preservado.');
  }
}

for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
  process.once(signal, () => {
    try { cleanup(); } catch (error) { console.error(redact(error.message)); }
    process.exit(code);
  });
}

async function request(baseUrl, method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method, signal: AbortSignal.timeout(5000),
    ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const text = await response.text();
  console.log(`${method} ${path} -> HTTP ${response.status}; corpo real: ${text || '(vazio)'}`);
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

try {
  console.log('=== T11 configuração/subida/ps ===');
  console.log(`Data/hora real: ${new Date().toISOString()}; projeto exclusivo ${project}; ambiente local, sem AWS.`);
  docker(['compose', 'version']);
  assert.deepEqual(ids(), []);
  assert.equal(docker(['network', 'ls', '-q', ...filter], { log: false }), '');
  assert.equal(docker(['volume', 'ls', '-q', ...filter], { log: false }), '');
  docker(['compose', '--project-name', project, '--file', composeFile, '--env-file', missingEnvFile, 'config', '--quiet'], { expectedExit: 1 });
  console.log('PASSOU: senha ausente rejeitada sem criar serviços ou divulgar credenciais.');
  compose(['config', '--quiet']);
  const config = JSON.parse(compose(['config', '--format', 'json'], { log: false }));
  assert.deepEqual(Object.keys(config.services).sort(), ['api', 'db']);
  assert.equal(config.services.db.image, readFileSync(join(root, 'app/test/postgres-image.txt'), 'utf8').trim());
  assert.equal(config.services.api.depends_on.db.condition, 'service_healthy');
  assert.equal(config.networks['reservas-net'].driver, 'bridge');
  assert.equal(config.services.api.environment.PGHOST, 'db');
  assert.equal(config.services.api.environment.PGPORT, '5432');
  assert.equal(config.services.api.environment.PGDATABASE, 'reservas_test');
  assert.equal(config.services.api.environment.PGUSER, 'reservas_test');
  assert.equal(config.services.api.environment.PGSSL, 'false');
  assert.ok(config.services.api.environment.PGPASSWORD === password && config.services.db.environment.POSTGRES_PASSWORD === password,
    'Senhas derivadas devem corresponder; valores não exibidos.');
  assert.equal(config.services.api.ports[0].host_ip, '127.0.0.1');
  assert.equal(config.services.db.ports, undefined);
  assert.match(config.services.db.healthcheck.test[1], /pg_isready -h 127\.0\.0\.1/);
  assert.ok(config.services.api.healthcheck.test.includes('node'));
  console.log('PASSOU: config expandida conferida só em memória; api/db, ambiente coerente, bridge, healthchecks e service_healthy.');
  creationAttempted = true;
  compose(['create', '--build'], { timeout: 180000 });
  const dbId = compose(['ps', '--all', '--quiet', 'db'], { log: false });
  const apiId = compose(['ps', '--all', '--quiet', 'api'], { log: false });
  assertOwner('container', dbId);
  assertOwner('container', apiId);
  assert.equal(inspect(dbId, '.State').Status, 'created');
  assert.equal(inspect(apiId, '.State').Status, 'created');
  console.log('Pré-condição real: containers db/api criados e parados; volume exclusivo novo, sem banco externo.');
  compose(['up', '--build', '--wait', '--wait-timeout', '60'], { timeout: 120000 });
  compose(['ps']);

  console.log('=== T11 rede/saúde/CRUD/SQL ===');
  const dbState = inspect(dbId, '.State');
  const apiState = inspect(apiId, '.State');
  assert.equal(dbState.Health.Status, 'healthy');
  assert.equal(apiState.Health.Status, 'healthy');
  const firstSuccess = dbState.Health.Log.find((entry) => entry.ExitCode === 0);
  assert.ok(firstSuccess, 'Log real deve conter healthcheck bem-sucedido do banco.');
  assert.ok(Date.parse(apiState.StartedAt) >= Date.parse(firstSuccess.End), 'API só deve iniciar depois do banco saudável.');
  console.log(`Healthcheck real db: exit ${firstSuccess.ExitCode}, início ${firstSuccess.Start}, fim ${firstSuccess.End}.`);
  console.log(`API iniciou em ${apiState.StartedAt}, depois do healthcheck db; estados atuais db/api: healthy/healthy.`);
  const labels = assertOwner('network', network);
  assert.equal(labels['com.docker.compose.network'], 'reservas-net');
  assert.equal(docker(['network', 'inspect', '--format', '{{.Driver}}', network]), 'bridge');
  const connected = JSON.parse(docker(['network', 'inspect', '--format', '{{json .Containers}}', network]));
  assert.deepEqual(Object.keys(connected).sort(), [apiId, dbId].sort());
  assert.equal(docker(['inspect', '--format', '{{json .HostConfig.PortBindings}}', dbId]), '{}');
  const ports = inspect(apiId, '.NetworkSettings.Ports');
  const binding = ports['3000/tcp'][0];
  assert.equal(binding.HostIp, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${binding.HostPort}`;
  const mounts = inspect(dbId, '.Mounts');
  assert.ok(mounts.some((mount) => mount.Type === 'volume' && mount.Name === volume && mount.Destination === '/var/lib/postgresql/data'));
  assert.ok(mounts.some((mount) => mount.Type === 'bind' && mount.Destination === '/docker-entrypoint-initdb.d/001-reservas.sql' && mount.RW === false));
  assert.equal(assertOwner('volume', volume)['com.docker.compose.volume'], 'reservas-data');
  console.log(`PASSOU: ${network} bridge contém somente api/db; banco sem porta publicada; API loopback ${binding.HostPort}; volume ${volume} e bootstrap read-only confirmados.`);
  compose(['exec', '-T', 'db', 'postgres', '--version']);
  assert.equal(compose(['exec', '-T', 'api', 'id', '-u']), '1000');
  assert.deepEqual(await request(baseUrl, 'GET', '/health'), { status: 200, body: { status: 'ok', database: 'ok' } });
  command('python3', [verifyScript, '--base-url', baseUrl]);
  const payload = { cliente: `Compose T11 ${project}`, data: '01-10-2026', status: 'pendente' };
  const created = await request(baseUrl, 'POST', '/reservas', payload);
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.ok(Number.isInteger(id) && id > 0);
  assert.deepEqual(created.body, { id, ...payload });
  const sql = (query) => compose(['exec', '-T', 'db', 'psql', '-U', 'reservas_test', '-d', 'reservas_test', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query]);
  const row = JSON.parse(sql(`SELECT json_build_object('id',id,'cliente',cliente,'data_iso',to_char(data,'YYYY-MM-DD'),'tipo',pg_typeof(data)::text,'status',status)::text FROM public.reservas WHERE id = ${id}`));
  assert.deepEqual(row, { id, cliente: payload.cliente, data_iso: '2026-10-01', tipo: 'date', status: 'pendente' });
  assert.deepEqual(await request(baseUrl, 'DELETE', `/reservas/${id}`), { status: 204, body: null });
  assert.equal(sql('SELECT count(*) FROM public.reservas'), '0');
  console.log('PASSOU: bootstrap do volume novo, seis rotas, CRUD/SQL reais e zero linhas de teste. Persistência após recriar será T12.');
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
} finally {
  try { cleanup(); } catch (error) {
    console.error(redact(error.message));
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log('PASSOU: T11 config/up/ps/rede/health/ordem/CRUD/SQL/limpeza.');
