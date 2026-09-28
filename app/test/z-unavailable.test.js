import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { createDatabasePool } from '../src/db.js';

let pool;
let server;
let baseUrl;
let container;

function docker(...args) {
  const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, 'Comando Docker do teste deve executar com sucesso.');
  return result.stdout.trim();
}

before(async () => {
  assert.equal(process.env.PGHOST, '127.0.0.1');
  assert.equal(process.env.PGDATABASE, 'reservas_test');
  assert.equal(process.env.PGUSER, 'reservas_test');
  assert.equal(process.env.PGSSL, 'false');
  const runId = process.env.DEVOPS_TEST_RUN_ID;
  assert.match(runId ?? '', /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
  container = process.env.DEVOPS_TEST_CONTAINER;
  assert.equal(container, `prova-reservas-test-${runId}`);
  // Consultar apenas labels/porta: nunca imprimir inspect com o ambiente/senha.
  const labels = JSON.parse(docker('inspect', '--format', '{{json .Config.Labels}}', container));
  assert.equal(labels['devops.project'], 'prova-primeiro-bimestre-devops');
  assert.equal(labels['devops.test.run'], runId);
  const ports = JSON.parse(docker('inspect', '--format', '{{json .NetworkSettings.Ports}}', container));
  assert.equal(ports['5432/tcp'][0].HostIp, '127.0.0.1');
  assert.equal(ports['5432/tcp'][0].HostPort, process.env.PGPORT);

  pool = createDatabasePool();
  server = createApp(pool).listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await pool?.end();
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(7000) });
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  return { status: response.status, body: await response.json() };
}

test('erro SQL inesperado mantém 500 genérico e restaura a tabela exclusiva', async (context) => {
  await pool.query('ALTER TABLE public.reservas RENAME TO reservas_teste_erro');
  try {
    const result = await request('/reservas');
    assert.equal(result.status, 500);
    assert.deepEqual(result.body, { erro: { codigo: 'ERRO_INTERNO', mensagem: 'Não foi possível processar a requisição.' } });
    context.diagnostic('Tabela temporariamente renomeada no banco exclusivo: erro SQL real -> 500 genérico, sem SQL/stack.');
  } finally {
    await pool.query('ALTER TABLE public.reservas_teste_erro RENAME TO reservas');
  }
});

test('health retorna 503 dentro do prazo quando PostgreSQL é pausado e volta a 200 após retomar', async (context) => {
  assert.deepEqual(await request('/health'), { status: 200, body: { status: 'ok', database: 'ok' } });
  docker('pause', container);
  try {
    assert.equal(docker('inspect', '--format', '{{.State.Paused}}', container), 'true');
    const start = performance.now();
    const result = await request('/health');
    const elapsed = performance.now() - start;
    assert.deepEqual(result, { status: 503, body: { status: 'unavailable', database: 'unavailable' } });
    // Folga de agendamento; o prazo implementado é 2000 ms.
    assert.ok(elapsed < 3500, `Resposta de saúde demorou ${elapsed} ms.`);
    context.diagnostic(`Docker pause confirmado; GET /health -> 503 em ${Math.round(elapsed)} ms (prazo 2000 ms).`);
  } finally {
    docker('unpause', container);
  }
  assert.deepEqual(await request('/health'), { status: 200, body: { status: 'ok', database: 'ok' } });
  context.diagnostic('Docker unpause; GET /health -> 200 com nova consulta real.');
});

test('banco encerrado de verdade retorna 503 uniforme no CRUD; entradas inválidas continuam 400', async (context) => {
  const body = { cliente: 'Teste T08 de indisponibilidade', data: '01-10-2026', status: 'pendente' };
  const created = await request('/reservas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(created.status, 201);
  const id = created.body.id;
  context.diagnostic('Antes da indisponibilidade: POST -> 201 com gravação real.');
  // Última suíte/último caso: encerrar somente o container UUID/labels conferidos.
  docker('stop', '--time', '5', container);
  assert.equal(docker('ps', '-aq', '--filter', `label=devops.test.run=${process.env.DEVOPS_TEST_RUN_ID}`), '');
  assert.deepEqual(await request('/health'), { status: 503, body: { status: 'unavailable', database: 'unavailable' } });
  for (const [method, path] of [
    ['GET', '/reservas'], ['GET', `/reservas/${id}`], ['POST', '/reservas'],
    ['PUT', `/reservas/${id}`], ['DELETE', `/reservas/${id}`],
  ]) {
    const options = { method };
    if (['POST', 'PUT'].includes(method)) {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    const result = await request(path, options);
    assert.deepEqual(result, { status: 503, body: { erro: { codigo: 'BANCO_INDISPONIVEL', mensagem: 'Banco de dados indisponível.' } } });
    context.diagnostic(`${method} ${path} com PostgreSQL encerrado -> 503 BANCO_INDISPONIVEL.`);
  }
  for (const method of ['GET', 'PUT', 'DELETE']) {
    assert.equal((await request('/reservas/0', { method })).status, 400);
  }
  for (const [method, path] of [['POST', '/reservas'], ['PUT', `/reservas/${id}`]]) {
    const result = await request(path, { method, headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(result.status, 400);
  }
  context.diagnostic('Docker stop/remove confirmado; health 503; validação pré-SQL continuou 400 sem banco.');
});
