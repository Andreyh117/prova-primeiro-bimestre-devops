import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const appDirectory = fileURLToPath(new URL('../', import.meta.url));
const script = fileURLToPath(new URL('../../scripts/verify-api.py', import.meta.url));
const image = 'prova-reservas:local';
const postgresImage = readFileSync(new URL('./postgres-image.txt', import.meta.url), 'utf8').trim();
assert.match(postgresImage, /^postgres@sha256:[a-f0-9]{64}$/);
const runId = randomUUID();
const network = `prova-reservas-docker-${runId}`;
const database = `${network}-db`;
const api = `${network}-api`;
const password = randomBytes(32).toString('hex');
const runtimeEnv = {
  ...process.env, POSTGRES_PASSWORD: password, PGPASSWORD: password,
  PGHOST: 'db', PGPORT: '5432', PGDATABASE: 'reservas_test', PGUSER: 'reservas_test', PGSSL: 'false',
};
const pgArgs = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGSSL']
  .flatMap((name) => ['--env', name]);
const labels = ['--label', 'devops.project=prova-primeiro-bimestre-devops', '--label', `devops.test.run=${runId}`];
const filter = ['--filter', `label=devops.test.run=${runId}`];
const temporary = mkdtempSync(join(tmpdir(), 'prova-reservas-context-'));
const markers = [];
const redact = (value = '') => String(value).replaceAll(password, '[REDACTED]');

function command(program, args, { input, expectedExit = 0, timeout = 30000, log = true } = {}) {
  // Citação shell só para exibir o comando; spawnSync recebe argumentos separados.
  const quote = (value) => "'" + value.replaceAll("'", "'\"'\"'") + "'";
  if (log) console.log(`Comando: ${program} ${args.map(quote).join(' ')}`);
  const result = spawnSync(program, args, {
    cwd: appDirectory, env: runtimeEnv, encoding: 'utf8', input, timeout,
    maxBuffer: 4 * 1024 * 1024,
  });
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

function removeMarkers() {
  for (const path of markers.splice(0)) rmSync(path, { force: true });
}

function assertOwner(kind, identifier) {
  const fields = kind === 'network' ? '{{json .Labels}}' : '{{json .Config.Labels}}';
  const actual = JSON.parse(docker([...(kind === 'network' ? ['network'] : []), 'inspect', '--format', fields, identifier], { log: false }));
  assert.equal(actual['devops.project'], 'prova-primeiro-bimestre-devops');
  assert.equal(actual['devops.test.run'], runId);
}

function cleanup() {
  removeMarkers();
  try {
    for (const id of docker(['ps', '-aq', ...filter], { log: false }).split(/\s+/).filter(Boolean)) {
      assertOwner('container', id);
      docker(['stop', '--timeout', '5', id]);
      docker(['rm', id]);
    }
    for (const id of docker(['network', 'ls', '-q', ...filter], { log: false }).split(/\s+/).filter(Boolean)) {
      assertOwner('network', id);
      docker(['network', 'rm', id]);
    }
    assert.equal(docker(['ps', '-aq', ...filter], { log: false }), '');
    assert.equal(docker(['network', 'ls', '-q', ...filter], { log: false }), '');
    console.log('Limpeza confirmada: zero containers/redes deste teste; marcadores locais removidos. Imagem local preservada.');
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
  process.once(signal, () => {
    try { cleanup(); } catch (error) { console.error(redact(error.message)); }
    process.exit(code);
  });
}

async function request(baseUrl, method, path, body) {
  const result = await fetch(`${baseUrl}${path}`, {
    method, signal: AbortSignal.timeout(5000),
    ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  const text = await result.text();
  const parsed = text ? JSON.parse(text) : null;
  console.log(`${method} ${path} -> HTTP ${result.status}; corpo real: ${text || '(vazio)'}`);
  return { status: result.status, body: parsed };
}

try {
  console.log('=== T10 build/contexto ===');
  console.log(`Data/hora real: ${new Date().toISOString()}; ambiente Docker local, sem Compose/AWS.`);
  docker(['version', '--format', '{{.Client.Version}} / {{.Server.Version}} / {{.Server.Arch}}']);
  const expectedFiles = ['package.json', 'package-lock.json',
    ...['src', 'sql'].flatMap((directory) => readdirSync(join(appDirectory, directory)).map((name) => `${directory}/${name}`))].sort();
  for (const relative of [`.env.t10-${runId}`, `src/.env.t10-${runId}`, `sql/t10-${runId}.pem`]) {
    const path = join(appDirectory, relative);
    writeFileSync(path, 'MARCADOR T10 SEM CREDENCIAL REAL\n', { flag: 'wx' });
    markers.push(path);
  }
  // Exportar COPY . de verdade: valida .dockerignore além das cópias seletivas da imagem.
  const contextDirectory = join(temporary, 'export');
  console.log('Dockerfile de auditoria via stdin: FROM scratch; COPY . /context/');
  docker(['build', '--no-cache', '--progress=plain', '--output', `type=local,dest=${contextDirectory}`, '-f', '-', '.'], {
    input: 'FROM scratch\nCOPY . /context/\n', timeout: 120000,
  });
  const exported = readdirSync(join(contextDirectory, 'context'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(join(contextDirectory, 'context').length + 1)).sort();
  assert.deepEqual(exported, expectedFiles, 'Contexto deve excluir marcadores, node_modules, testes e outros artefatos.');
  console.log(`PASSOU: contexto exportado contém somente ${JSON.stringify(exported)}; marcadores .env/PEM ausentes.`);
  removeMarkers();
  docker(['build', '--progress=plain', '-t', image, '.'], { timeout: 180000 });
  const metadata = JSON.parse(docker(['image', 'inspect', '--format', '{{json .Config.User}}', image]));
  assert.equal(metadata, 'node');
  assert.equal(docker(['run', '--rm', ...labels, '--entrypoint', 'id', image, '-u']), '1000');
  assert.equal(docker(['run', '--rm', ...labels, '--entrypoint', 'node', image, '--version']), 'v24.21.0');
  docker(['image', 'inspect', '--format', '{{.Id}} / {{.Os}} / {{.Architecture}} / {{.Size}} bytes', image]);
  console.log('PASSOU: build real, imagem configurada USER node e UID efetivo 1000.');

  console.log('=== T10 runtime/PostgreSQL ===');
  console.log(`Data/hora real: ${new Date().toISOString()}; run UUID ${runId}; senha somente em memória/ambiente.`);
  docker(['network', 'create', '--driver', 'bridge', ...labels, network]);
  assertOwner('network', network);
  docker(['run', '--detach', '--name', database, ...labels, '--network', network, '--network-alias', 'db',
    '--tmpfs', '/var/lib/postgresql/data:rw,size=256m', '--env', 'POSTGRES_PASSWORD',
    '--env', 'POSTGRES_USER=reservas_test', '--env', 'POSTGRES_DB=reservas_test', postgresImage]);
  assertOwner('container', database);
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = spawnSync('docker', ['exec', database, 'pg_isready', '-h', '127.0.0.1', '-U', 'reservas_test', '-d', 'reservas_test'], {
      env: runtimeEnv, encoding: 'utf8', timeout: 15000,
    });
    if (result.status === 0) { ready = true; break; }
    await delay(500);
  }
  assert.equal(ready, true, 'PostgreSQL exclusivo deve ficar pronto.');
  docker(['exec', database, 'postgres', '--version']);
  assert.equal(docker(['inspect', '--format', '{{json .HostConfig.PortBindings}}', database]), '{}');
  docker(['run', '--rm', ...labels, '--network', network, ...pgArgs, image, 'node', 'src/migrate.js']);
  docker(['run', '--detach', '--name', api, ...labels, '--network', network,
    '--publish', '127.0.0.1::3000', ...pgArgs, image]);
  assertOwner('container', api);
  const ports = JSON.parse(docker(['inspect', '--format', '{{json .NetworkSettings.Ports}}', api]));
  const binding = ports['3000/tcp'][0];
  assert.equal(binding.HostIp, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${binding.HostPort}`;
  let healthy = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
      if (response.status === 200) { healthy = true; break; }
    } catch { /* Aguardar somente esta API criada pelo runner. */ }
    await delay(200);
  }
  assert.equal(healthy, true, 'API em container deve consultar o banco real.');
  assert.deepEqual(await request(baseUrl, 'GET', '/health'), { status: 200, body: { status: 'ok', database: 'ok' } });
  assert.equal(docker(['exec', api, 'id', '-u']), '1000');
  docker(['exec', api, 'node', '-e', "const f=require('node:fs'),a=require('node:assert/strict'),cmd=f.readFileSync('/proc/1/cmdline','utf8').split('\\0').filter(Boolean),uid=f.readFileSync('/proc/1/status','utf8').split('\\n').find(l=>l.startsWith('Uid:'));a.deepEqual(cmd,['node','src/server.js']);a.deepEqual(uid.split(/\\s+/).slice(1),['1000','1000','1000','1000']);console.log(cmd.join(' '));console.log(uid);"]);
  docker(['exec', api, 'node', '-e', "const f=require('node:fs'),a=require('node:assert/strict');a.deepEqual(f.readdirSync('/app').sort(),['node_modules','package-lock.json','package.json','sql','src']);console.log('PASSOU: /app contém somente dependências, manifests, src e sql; sem testes/.env locais.');"]);
  command('python3', [script, '--base-url', baseUrl]);

  const payload = { cliente: `Container T10 ${runId}`, data: '01-10-2026', status: 'pendente' };
  const created = await request(baseUrl, 'POST', '/reservas', payload);
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.ok(Number.isInteger(id) && id > 0);
  assert.deepEqual(created.body, { id, ...payload });
  const sql = (query) => docker(['exec', database, 'psql', '-U', 'reservas_test', '-d', 'reservas_test', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query]);
  const row = JSON.parse(sql(`SELECT json_build_object('id', id, 'cliente', cliente, 'data_iso', to_char(data, 'YYYY-MM-DD'), 'tipo', pg_typeof(data)::text, 'status', status)::text FROM public.reservas WHERE id = ${id}`));
  assert.deepEqual(row, { id, cliente: payload.cliente, data_iso: '2026-10-01', tipo: 'date', status: 'pendente' });
  assert.deepEqual(await request(baseUrl, 'DELETE', `/reservas/${id}`), { status: 204, body: null });
  assert.equal(sql('SELECT count(*) FROM public.reservas'), '0');
  console.log('PASSOU: HTTP/SQL reais no PostgreSQL separado; DATE preservado e zero linhas após limpeza.');
  docker(['logs', api]);
  docker(['stop', '--timeout', '5', api]);
  assert.equal(docker(['inspect', '--format', '{{.State.ExitCode}}', api]), '0');
  console.log('PASSOU: servidor em container recebeu SIGTERM e encerrou com exit 0.');
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
} finally {
  try { cleanup(); } catch (error) {
    console.error(redact(error.message));
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log('PASSOU: T10 build/contexto/UID/health/CRUD/SQL/encerramento/limpeza.');
