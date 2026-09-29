import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createDatabasePool } from '../src/db.js';
import { startNativeApi } from './helpers/native-api.js';

const script = fileURLToPath(new URL('../../scripts/verify-api.py', import.meta.url));
let pool;
let api;

before(async () => {
  assert.equal(process.env.PGHOST, '127.0.0.1');
  assert.equal(process.env.PGDATABASE, 'reservas_test');
  assert.equal(process.env.PGUSER, 'reservas_test');
  assert.equal(process.env.PGSSL, 'false');
  const runId = process.env.DEVOPS_TEST_RUN_ID;
  assert.match(runId ?? '', /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
  const container = process.env.DEVOPS_TEST_CONTAINER;
  assert.equal(container, `prova-reservas-test-${runId}`);
  const inspect = (field) => {
    const result = spawnSync('docker', ['inspect', '--format', `{{json ${field}}}`, container], {
      encoding: 'utf8', timeout: 15000,
    });
    assert.equal(result.status, 0, 'Banco deve pertencer ao runner isolado.');
    return JSON.parse(result.stdout);
  };
  const labels = inspect('.Config.Labels');
  assert.equal(labels['devops.project'], 'prova-primeiro-bimestre-devops');
  assert.equal(labels['devops.test.run'], runId);
  const ports = inspect('.NetworkSettings.Ports');
  assert.equal(ports['5432/tcp'][0].HostIp, '127.0.0.1');
  assert.equal(ports['5432/tcp'][0].HostPort, process.env.PGPORT);
  pool = createDatabasePool();
  assert.deepEqual((await snapshot()).rows, []);
  api = await startNativeApi();
});

after(async (context) => {
  try {
    if (api) {
      await api.stop();
      context.diagnostic(`API nativa final PID ${api.pid}: SIGTERM -> exit 0.`);
    }
  } finally {
    await pool?.end();
  }
});

function snapshot() {
  return pool.query("SELECT id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status FROM public.reservas ORDER BY id");
}

async function seedSentinel() {
  const { rows: [row] } = await pool.query(
    "INSERT INTO public.reservas (cliente, data, status) VALUES ($1, '2026-10-01', 'pendente') RETURNING id",
    [`Sentinela T09 ${randomUUID()}`],
  );
  return row.id;
}

function verify(context, expectedExit) {
  const result = spawnSync('python3', [script, '--base-url', api.baseUrl], {
    encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024,
  });
  context.diagnostic(`Comando: python3 scripts/verify-api.py --base-url ${api.baseUrl}`);
  context.diagnostic(`stdout real:\n${result.stdout}`);
  context.diagnostic(`stderr real:\n${result.stderr || '(vazio)'}`);
  context.diagnostic(`Exit code real do script: ${result.status}`);
  assert.equal(result.error, undefined, 'Python deve executar dentro do prazo.');
  assert.equal(result.status, expectedExit);
  return result;
}

test('verify-api.py executa CRUD real, limpa IDs próprios e preserva reserva preexistente', async (context) => {
  const sentinel = await seedSentinel();
  try {
    const baseline = (await snapshot()).rows;
    const result = verify(context, 0);
    assert.match(result.stdout, /PASSOU: CRUD, entradas inválidas, 404 e limpeza verificados\./);
    assert.equal(result.stderr, '');
    assert.deepEqual((await snapshot()).rows, baseline, 'Script não pode remover/alterar outras reservas.');
    context.diagnostic(`SQL independente: somente a sentinela ID ${sentinel} permanece, inalterada.`);
  } finally {
    await pool.query('DELETE FROM public.reservas WHERE id = $1', [sentinel]);
  }
});

test('verify-api.py retorna exit 1 na falha SQL controlada e limpa a reserva criada antes do erro', async (context) => {
  const sentinel = await seedSentinel();
  let constraintAdded = false;
  try {
    const baseline = (await snapshot()).rows;
    // Somente banco UUID/labels/porta conferidos. POST passa; PUT gera erro SQL real.
    await pool.query("ALTER TABLE public.reservas ADD CONSTRAINT t09_falha_controlada CHECK (status <> 'confirmada')");
    constraintAdded = true;
    const result = verify(context, 1);
    assert.match(result.stderr, /PUT \/reservas\/\d+: esperado HTTP 200, recebido 500/);
    assert.match(result.stdout, /Limpeza confirmada: nenhuma reserva com ID próprio remanescente\./);
    assert.doesNotMatch(result.stdout, /PASSOU: CRUD, entradas inválidas, 404 e limpeza verificados/);
    assert.deepEqual((await snapshot()).rows, baseline);
    context.diagnostic(`CHECK temporário induziu PUT 500 real; SQL confirma limpeza e sentinela ID ${sentinel} inalterada.`);
  } finally {
    if (constraintAdded) await pool.query('ALTER TABLE public.reservas DROP CONSTRAINT t09_falha_controlada');
    await pool.query('DELETE FROM public.reservas WHERE id = $1', [sentinel]);
  }
});

test('reserva persiste por SQL e HTTP após encerrar a API e iniciar outro processo na mesma porta', async (context) => {
  const payload = { cliente: `Persistencia T09 ${randomUUID()}`, data: '01-10-2026', status: 'pendente' };
  let rowId;
  const sqlRow = async () => (await pool.query(
    "SELECT id, cliente, to_char(data, 'YYYY-MM-DD') AS data_iso, status, pg_typeof(data)::text AS tipo FROM public.reservas WHERE id = $1",
    [rowId],
  )).rows[0];
  const databaseStarted = async () => (await pool.query('SELECT pg_postmaster_start_time()::text AS inicio')).rows[0].inicio;
  try {
    const response = await fetch(`${api.baseUrl}/reservas`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 201);
    const created = await response.json();
    rowId = created.id;
    assert.ok(Number.isInteger(rowId) && rowId > 0);
    assert.deepEqual(created, { id: rowId, ...payload });
    const sqlBefore = await sqlRow();
    assert.deepEqual(sqlBefore, { id: rowId, cliente: payload.cliente, data_iso: '2026-10-01', status: 'pendente', tipo: 'date' });
    const pgStart = await databaseStarted();
    context.diagnostic(`Antes: API PID ${api.pid}; POST 201 ${JSON.stringify(created)}; SQL ${JSON.stringify(sqlBefore)}.`);
    const firstPid = api.pid;
    const port = api.port;
    await api.stop();
    context.diagnostic(`API PID ${firstPid} encerrada realmente: SIGTERM -> exit 0.`);
    assert.deepEqual(await sqlRow(), sqlBefore);
    context.diagnostic(`Com a API encerrada, consulta SQL independente ainda lê ${JSON.stringify(await sqlRow())}.`);
    api = await startNativeApi(port);
    assert.notEqual(api.pid, firstPid);
    assert.equal(api.port, port);
    const fetched = await fetch(`${api.baseUrl}/reservas/${rowId}`, { signal: AbortSignal.timeout(5000) });
    assert.equal(fetched.status, 200);
    assert.deepEqual(await fetched.json(), created);
    const listed = await fetch(`${api.baseUrl}/reservas`, { signal: AbortSignal.timeout(5000) });
    assert.equal(listed.status, 200);
    assert.deepEqual((await listed.json()).find((row) => row.id === rowId), created);
    assert.deepEqual(await sqlRow(), sqlBefore);
    assert.equal(await databaseStarted(), pgStart, 'PostgreSQL não deve ser reiniciado neste teste.');
    context.diagnostic(`Depois: API PID ${api.pid}, mesma porta ${port}; GET 200 ${JSON.stringify(created)}; SQL idêntico.`);
    context.diagnostic(`PostgreSQL permaneceu iniciado desde ${pgStart}; somente o processo da API foi reiniciado.`);
  } finally {
    if (Number.isInteger(rowId)) await pool.query('DELETE FROM public.reservas WHERE id = $1', [rowId]);
    assert.deepEqual((await snapshot()).rows, [], 'Sem linhas remanescentes dos testes T09.');
    context.diagnostic('SQL final: zero reservas remanescentes da suíte T09.');
  }
});
