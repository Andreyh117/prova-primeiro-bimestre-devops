import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { createDatabasePool } from '../src/db.js';

let pool;
let api;
let apiExit;
let baseUrl;
const createdIds = new Set();
const valid = { cliente: 'Cliente T07', data: '15-10-2026', status: 'pendente' };

before(async (context) => {
  assert.equal(process.env.PGHOST, '127.0.0.1');
  assert.equal(process.env.PGDATABASE, 'reservas_test');
  assert.equal(process.env.PGUSER, 'reservas_test');
  assert.equal(process.env.PGSSL, 'false');
  pool = createDatabasePool();

  // Selecionar porta livre de loopback, sem assumir que 3000 está disponível.
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  baseUrl = `http://127.0.0.1:${port}`;
  api = spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  apiExit = once(api, 'exit');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API não iniciou dentro do prazo.')), 5000);
    api.once('error', (error) => { clearTimeout(timer); reject(error); });
    api.once('exit', () => { clearTimeout(timer); reject(new Error('API encerrou antes de iniciar.')); });
    let output = '';
    api.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes(`API de reservas escutando na porta ${port}.`)) {
        clearTimeout(timer);
        resolve();
      }
    });
    api.stderr.on('data', (chunk) => context.diagnostic(String(chunk).trim()));
  });
  context.diagnostic('API nativa iniciada em subprocesso; HTTP real e PostgreSQL real, sem mocks.');
});

beforeEach(async () => {
  assert.equal(await rowCount(), 0, 'A suíte deve iniciar cada caso sem linhas remanescentes.');
});

afterEach(async () => {
  if (!pool) return;
  await pool.query('DELETE FROM public.reservas WHERE id = ANY($1::integer[])', [[...createdIds]]);
  createdIds.clear();
});

after(async (context) => {
  if (api && api.exitCode === null && api.signalCode === null) {
    api.kill('SIGTERM');
    let timer;
    try {
      const result = await Promise.race([
        apiExit,
        new Promise((resolve, reject) => {
          timer = setTimeout(() => { api.kill('SIGKILL'); reject(new Error('API não encerrou após SIGTERM.')); }, 5000);
        }),
      ]);
      assert.deepEqual(result, [0, null], 'Servidor deve encerrar normalmente.');
      context.diagnostic('API encerrada com SIGTERM, código 0.');
    } finally {
      clearTimeout(timer);
      await pool?.end();
    }
  } else {
    await pool?.end();
  }
});

async function rowCount() {
  const { rows: [row] } = await pool.query('SELECT count(*)::integer AS count FROM public.reservas');
  return row.count;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(5000) });
  if (response.status === 204) {
    assert.equal(await response.text(), '', 'DELETE 204 deve ter corpo vazio.');
    assert.equal(response.headers.get('content-type'), null);
    return { status: response.status, body: null, headers: response.headers };
  }
  const body = await response.json();
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  if (options.method === 'POST' && Number.isInteger(body.id)) createdIds.add(body.id);
  return { status: response.status, body, headers: response.headers };
}

function post(body, headers = { 'content-type': 'application/json' }) {
  return request('/reservas', { method: 'POST', headers, body: JSON.stringify(body) });
}

async function rejected(body, expectedStatus = 400, headers) {
  const before = await rowCount();
  const result = await post(body, headers);
  assert.equal(result.status, expectedStatus, JSON.stringify(body));
  assert.deepEqual(Object.keys(result.body), ['erro']);
  assert.deepEqual(Object.keys(result.body.erro).sort(), ['codigo', 'mensagem']);
  assert.equal(typeof result.body.erro.mensagem, 'string');
  assert.equal(result.body.erro.codigo, expectedStatus === 400 ? 'ENTRADA_INVALIDA' : 'TIPO_NAO_SUPORTADO');
  assert.equal(await rowCount(), before, 'Entrada rejeitada não pode inserir linha.');
  return result;
}

test('GET lista vazia devolve 200 e array vazio', async () => {
  const result = await request('/reservas');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

test('POST cria 201, Location e quatro campos; GET e SQL confirmam mesma linha', async (context) => {
  const input = { ...valid, cliente: "  D'Ávila T07  " };
  const result = await post(input);
  assert.equal(result.status, 201);
  assert.ok(Number.isInteger(result.body.id) && result.body.id > 0);
  assert.deepEqual(result.body, { id: result.body.id, ...valid, cliente: "D'Ávila T07" });
  assert.equal(result.headers.get('location'), `/reservas/${result.body.id}`);
  const read = await request(result.headers.get('location'));
  assert.equal(read.status, 200);
  assert.deepEqual(read.body, result.body);
  const { rows } = await pool.query(`
    SELECT id, cliente, to_char(data, 'YYYY-MM-DD') AS data, pg_typeof(data)::text AS tipo, status
    FROM public.reservas WHERE id = $1
  `, [result.body.id]);
  assert.deepEqual(rows, [{ id: result.body.id, cliente: "D'Ávila T07", data: '2026-10-15', tipo: 'date', status: 'pendente' }]);
  context.diagnostic(`POST /reservas -> 201; Location ${result.headers.get('location')}; JSON ${JSON.stringify(result.body)}`);
  context.diagnostic(`GET por ID -> 200; SQL por conexão independente -> ${JSON.stringify(rows[0])}`);
});

test('GET lista todos os status em ordem crescente de ID', async () => {
  const expected = [];
  for (const status of ['pendente', 'confirmada', 'cancelada']) {
    const result = await post({ ...valid, status });
    assert.equal(result.status, 201);
    expected.push(result.body);
  }
  const result = await request('/reservas');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, expected);
  assert.deepEqual(result.body.map((row) => row.id), result.body.map((row) => row.id).sort((a, b) => a - b));
});

test('GET consulta estado atual do PostgreSQL, incluindo alteração feita diretamente por SQL', async () => {
  const created = await post(valid);
  assert.equal(created.status, 201);
  const expected = { id: created.body.id, cliente: 'Alterado por SQL T07', data: '29-02-2024', status: 'confirmada' };
  await pool.query('UPDATE public.reservas SET cliente = $1, data = $2::date, status = $3 WHERE id = $4', [
    expected.cliente, '2024-02-29', expected.status, expected.id,
  ]);
  const read = await request(`/reservas/${expected.id}`);
  assert.equal(read.status, 200);
  assert.deepEqual(read.body, expected);
  assert.deepEqual((await request('/reservas')).body, [expected]);
});

test('GET de ID válido ausente retorna 404, inclusive limite INTEGER', async (context) => {
  for (const id of [1, 2147483647]) {
    const result = await request(`/reservas/${id}`);
    assert.equal(result.status, 404);
    assert.deepEqual(result.body, { erro: { codigo: 'RESERVA_NAO_ENCONTRADA', mensagem: 'Reserva não encontrada.' } });
  }
  context.diagnostic('GET de ID ausente -> 404 RESERVA_NAO_ENCONTRADA.');
});

test('GET rejeita IDs inválidos com 400 sem confundir com 404', async () => {
  for (const id of ['0', '-1', '1.5', '1e2', 'NaN', '+1', ' 1', '1\n', '2147483648', '99999999999999999999999', "1';DROP TABLE reservas;--"]) {
    const result = await request(`/reservas/${encodeURIComponent(id)}`);
    assert.equal(result.status, 400, JSON.stringify(id));
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
  }
  for (const path of ['/reservas/%', '/reservas/%ZZ', '/reservas/%E0%A4%A']) {
    const result = await request(path);
    assert.equal(result.status, 400, path);
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
  }
  assert.equal(await rowCount(), 0);
});

test('datas válidas, extremos e anos bissextos mantêm DD-MM-YYYY em POST, GET e lista', async () => {
  for (const data of ['01-01-0001', '29-02-2000', '29-02-2024', '01-10-2026', '29-02-2400', '31-12-9999']) {
    const result = await post({ ...valid, data });
    assert.equal(result.status, 201, data);
    assert.equal(result.body.data, data);
    const read = await request(`/reservas/${result.body.id}`);
    assert.equal(read.status, 200);
    assert.deepEqual(read.body, result.body);
  }
  const list = await request('/reservas');
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.map((row) => row.data), ['01-01-0001', '29-02-2000', '29-02-2024', '01-10-2026', '29-02-2400', '31-12-9999']);
});

test('datas impossíveis, formatos alternativos, espaços e tipos incorretos retornam 400 sem gravar', async (context) => {
  const dates = ['29-02-1900', '29-02-2025', '31-04-2026', '00-10-2026', '32-10-2026', '15-00-2026', '15-13-2026', '01-01-0000',
    '2026-10-15', '1-2-2026', '15/10/2026', '15-10-2026T00:00:00', ' 15-10-2026', '15-10-2026\n', '', null, 20261015, [], {}];
  for (const data of dates) await rejected({ ...valid, data });
  context.diagnostic(`${dates.length} datas inválidas -> 400; quantidade de linhas permaneceu 0.`);
});

test('cada campo obrigatório ausente retorna 400', async () => {
  for (const field of ['cliente', 'data', 'status']) {
    const body = { ...valid };
    delete body[field];
    await rejected(body);
  }
});

test('cliente vazio, tipos errados, NUL e Unicode inválido retornam 400', async () => {
  for (const cliente of ['', ' \t\n ', null, 42, true, [], {}, 'a\0b', '\ud800']) {
    await rejected({ ...valid, cliente });
  }
});

test('cliente aceita 120 caracteres Unicode e rejeita 121 após trim', async () => {
  const cliente = '🧪'.repeat(120);
  const result = await post({ ...valid, cliente: ` ${cliente} ` });
  assert.equal(result.status, 201);
  assert.equal(result.body.cliente, cliente);
  assert.equal((await request(`/reservas/${result.body.id}`)).body.cliente, cliente);
  await rejected({ ...valid, cliente: '🧪'.repeat(121) });
});

test('status exige um dos três valores exatos, sem valor padrão', async () => {
  for (const status of ['', 'PENDENTE', 'pendente ', 'ativa', null, 0, true, [], {}]) {
    await rejected({ ...valid, status });
  }
});

test('POST exige objeto com os três campos exatos, rejeitando id e campos desconhecidos', async () => {
  for (const body of [null, [], 'texto', 0, true, {}, { ...valid, id: 1 }, { ...valid, extra: 'x' }, { ...valid, constructor: 'x' }]) {
    await rejected(body);
  }
});

test('JSON malformado e corpo vazio retornam 400 sem HTML ou stack trace', async () => {
  for (const body of ['{"cliente":', '']) {
    const result = await request('/reservas', { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    assert.equal(result.status, 400);
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
    assert.deepEqual(Object.keys(result.body), ['erro']);
    assert.equal(await rowCount(), 0);
  }
});

test('Content-Type inadequado ou ausente retorna 415 sem inserir', async () => {
  for (const headers of [{ 'content-type': 'text/plain' }, { 'content-type': 'application/x-www-form-urlencoded' }, {}]) {
    await rejected(valid, 415, headers);
  }
});

test('limite de corpo aceita 16 KiB e rejeita 16 KiB + 1 byte com 413 sem inserir', async (context) => {
  const json = JSON.stringify(valid);
  const body = json + ' '.repeat(16 * 1024 - Buffer.byteLength(json));
  const options = { method: 'POST', headers: { 'content-type': 'application/json' } };
  assert.equal(Buffer.byteLength(body), 16 * 1024);
  const accepted = await request('/reservas', { ...options, body });
  assert.equal(accepted.status, 201);
  const before = await rowCount();
  const result = await request('/reservas', { ...options, body: body + ' ' });
  assert.equal(result.status, 413);
  assert.equal(result.body.erro.codigo, 'CORPO_EXCESSIVO');
  assert.equal(await rowCount(), before);
  context.diagnostic('16 KiB -> 201; 16385 bytes -> 413; nenhuma linha extra.');
});

test('texto contendo SQL é preservado como dado por POST e GET, sem executar comandos', async () => {
  const cliente = "D'Ávila'); DROP TABLE reservas; --";
  const result = await post({ ...valid, cliente });
  assert.equal(result.status, 201);
  assert.equal(result.body.cliente, cliente);
  assert.deepEqual((await request(`/reservas/${result.body.id}`)).body, result.body);
  assert.equal(await rowCount(), 1);
});


function put(id, body, headers = { 'content-type': 'application/json' }) {
  return request(`/reservas/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
}

test('PUT completo preserva ID, altera os três campos e mantém a outra reserva intacta', async (context) => {
  const original = await post(valid);
  const other = await post({ ...valid, cliente: 'Outra reserva T08' });
  assert.equal(original.status, 201);
  assert.equal(other.status, 201);
  const body = { cliente: "  D'Ávila atualizado T08  ", data: '29-02-2024', status: 'confirmada' };
  const expected = { id: original.body.id, ...body, cliente: "D'Ávila atualizado T08" };
  const updated = await put(original.body.id, body);
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body, expected);
  assert.deepEqual((await request(`/reservas/${original.body.id}`)).body, expected);
  assert.deepEqual((await request(`/reservas/${other.body.id}`)).body, other.body);
  const { rows } = await pool.query(`
    SELECT id, cliente, to_char(data, 'YYYY-MM-DD') AS data, pg_typeof(data)::text AS tipo, status
    FROM public.reservas WHERE id = $1
  `, [original.body.id]);
  assert.deepEqual(rows, [{ id: original.body.id, cliente: expected.cliente, data: '2024-02-29', tipo: 'date', status: 'confirmada' }]);
  assert.equal(await rowCount(), 2);
  context.diagnostic(`PUT -> 200, mesmo ID ${original.body.id}; JSON ${JSON.stringify(updated.body)}; SQL DATE 2024-02-29.`);
});

test('PUT repetido é idempotente e aceita datas extremas, bissextas e todos os status', async () => {
  const created = await post(valid);
  assert.equal(created.status, 201);
  for (const [data, status] of [['01-01-0001', 'pendente'], ['29-02-2000', 'confirmada'], ['31-12-9999', 'cancelada']]) {
    const body = { cliente: '🧪'.repeat(120), data, status };
    const expected = { id: created.body.id, ...body };
    for (let attempt = 0; attempt < 2; attempt++) {
      const updated = await put(created.body.id, body);
      assert.equal(updated.status, 200);
      assert.deepEqual(updated.body, expected);
      assert.deepEqual((await request(`/reservas/${created.body.id}`)).body, expected);
      assert.equal(await rowCount(), 1);
    }
  }
});

test('PUT rejeita corpo parcial, campos extras e id sem alterar a linha', async () => {
  const created = await post(valid);
  assert.equal(created.status, 201);
  const cases = [null, [], {}, { ...valid, id: created.body.id }, { ...valid, extra: 'x' }];
  for (const field of ['cliente', 'data', 'status']) {
    const partial = { ...valid };
    delete partial[field];
    cases.push(partial);
  }
  for (const body of cases) {
    const result = await put(created.body.id, body);
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
    assert.deepEqual((await request(`/reservas/${created.body.id}`)).body, created.body);
    assert.equal(await rowCount(), 1);
  }
});

test('PUT rejeita campos e datas inválidas sem mudar os dados persistidos', async () => {
  const created = await post(valid);
  assert.equal(created.status, 201);
  const cases = [];
  for (const data of ['29-02-1900', '29-02-2025', '31-04-2026', '01-01-0000', '2026-10-15', '1-2-2026', '15-10-2026\n', null, 20261015]) {
    cases.push({ ...valid, data });
  }
  for (const cliente of ['', ' \t ', null, 42, '🧪'.repeat(121), 'a\0b', '\ud800']) cases.push({ ...valid, cliente });
  for (const status of ['', 'CONFIRMADA', 'ativa', null, 0, [], {}]) cases.push({ ...valid, status });
  for (const body of cases) {
    const result = await put(created.body.id, body);
    assert.equal(result.status, 400, JSON.stringify(body));
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
    assert.deepEqual((await request(`/reservas/${created.body.id}`)).body, created.body);
    assert.equal(await rowCount(), 1);
  }
});

test('PUT de ID ausente retorna 404 sem criar linha; corpo inválido retorna 400', async () => {
  const result = await put(2147483647, valid);
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { erro: { codigo: 'RESERVA_NAO_ENCONTRADA', mensagem: 'Reserva não encontrada.' } });
  assert.equal((await put(2147483647, {})).status, 400);
  assert.equal(await rowCount(), 0);
});

test('PUT e DELETE rejeitam IDs e URLs inválidos com 400', async () => {
  for (const method of ['PUT', 'DELETE']) {
    const options = { method };
    if (method === 'PUT') {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify(valid);
    }
    for (const id of ['0', '-1', '1.5', '1e2', '+1', ' 1', '1\n', '2147483648', "1';DROP TABLE reservas;--"]) {
      const result = await request(`/reservas/${encodeURIComponent(id)}`, options);
      assert.equal(result.status, 400);
      assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
    }
    for (const path of ['/reservas/%', '/reservas/%ZZ']) {
      const result = await request(path, options);
      assert.equal(result.status, 400);
      assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
    }
  }
  assert.equal(await rowCount(), 0);
});

test('PUT aplica os mesmos erros JSON 400, limite 413 e Content-Type 415 do POST', async () => {
  const created = await post(valid);
  assert.equal(created.status, 201);
  const path = `/reservas/${created.body.id}`;
  for (const body of ['{"cliente":', '']) {
    const result = await request(path, { method: 'PUT', headers: { 'content-type': 'application/json' }, body });
    assert.equal(result.status, 400);
    assert.equal(result.body.erro.codigo, 'ENTRADA_INVALIDA');
  }
  for (const headers of [{ 'content-type': 'text/plain' }, {}]) {
    const result = await put(created.body.id, valid, headers);
    assert.equal(result.status, 415);
    assert.equal(result.body.erro.codigo, 'TIPO_NAO_SUPORTADO');
  }
  const json = JSON.stringify(valid);
  const body = json + ' '.repeat(16 * 1024 - Buffer.byteLength(json));
  const options = { method: 'PUT', headers: { 'content-type': 'application/json' } };
  assert.equal((await request(path, { ...options, body })).status, 200);
  const result = await request(path, { ...options, body: body + ' ' });
  assert.equal(result.status, 413);
  assert.equal(result.body.erro.codigo, 'CORPO_EXCESSIVO');
  assert.deepEqual((await request(path)).body, created.body);
  assert.equal(await rowCount(), 1);
});

test('DELETE remove somente a reserva pedida, retorna 204 vazio e segundo DELETE retorna 404', async (context) => {
  const created = await post(valid);
  const other = await post({ ...valid, cliente: 'Reserva preservada T08' });
  assert.equal(created.status, 201);
  assert.equal(other.status, 201);
  const path = `/reservas/${created.body.id}`;
  const deleted = await request(path, { method: 'DELETE' });
  assert.equal(deleted.status, 204);
  assert.equal(deleted.body, null);
  const { rows } = await pool.query('SELECT id FROM public.reservas WHERE id = $1', [created.body.id]);
  assert.deepEqual(rows, []);
  assert.deepEqual((await request(`/reservas/${other.body.id}`)).body, other.body);
  assert.equal((await request(path)).status, 404);
  const second = await request(path, { method: 'DELETE' });
  assert.equal(second.status, 404);
  assert.equal(second.body.erro.codigo, 'RESERVA_NAO_ENCONTRADA');
  assert.equal(await rowCount(), 1);
  context.diagnostic('DELETE -> 204, corpo vazio; SQL confirmou remoção; segundo DELETE -> 404; outra reserva preservada.');
});

test('DELETE de ID ausente retorna 404 com o mesmo erro das consultas', async () => {
  const result = await request('/reservas/2147483647', { method: 'DELETE' });
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { erro: { codigo: 'RESERVA_NAO_ENCONTRADA', mensagem: 'Reserva não encontrada.' } });
  assert.equal(await rowCount(), 0);
});

test('health com PostgreSQL disponível retorna 200 e somente status/database, sem cache', async (context) => {
  const result = await request('/health');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: 'ok', database: 'ok' });
  assert.equal(result.headers.get('cache-control'), 'no-store');
  context.diagnostic('GET /health com conexão real -> 200 {"status":"ok","database":"ok"}.');
});
