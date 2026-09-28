import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createDatabasePool } from '../src/db.js';
import { applySchema } from '../src/schema.js';

let pool;

before(async () => {
  // A suíte grava dados: recusar qualquer destino fora do banco local exclusivo.
  assert.equal(process.env.PGHOST, '127.0.0.1', 'Use o PostgreSQL de teste no loopback.');
  assert.equal(process.env.PGDATABASE, 'reservas_test', 'Use somente o banco reservas_test.');
  assert.equal(process.env.PGUSER, 'reservas_test', 'Use somente o usuário reservas_test.');
  assert.equal(process.env.PGSSL, 'false', 'Esta suíte usa a conexão local de teste.');
  pool = createDatabasePool();
  await applySchema(pool);
});

after(async () => {
  await pool?.end();
});

async function withTransaction(check) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await check(client);
  } finally {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}

const insertSql = `
  INSERT INTO reservas (cliente, data, status)
  VALUES ($1, $2::date, $3)
  RETURNING id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status
`;

test('schema contém somente as quatro colunas, tipos e identidade aprovados', async () => {
  const { rows } = await pool.query(`
    SELECT column_name, data_type, is_nullable, character_maximum_length,
           is_identity, identity_generation
    FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'reservas'
    ORDER BY ordinal_position
  `);
  assert.deepEqual(rows, [
    {
      column_name: 'id', data_type: 'integer', is_nullable: 'NO',
      character_maximum_length: null, is_identity: 'YES', identity_generation: 'ALWAYS',
    },
    {
      column_name: 'cliente', data_type: 'character varying', is_nullable: 'NO',
      character_maximum_length: 120, is_identity: 'NO', identity_generation: null,
    },
    {
      column_name: 'data', data_type: 'date', is_nullable: 'NO',
      character_maximum_length: null, is_identity: 'NO', identity_generation: null,
    },
    {
      column_name: 'status', data_type: 'character varying', is_nullable: 'NO',
      character_maximum_length: 10, is_identity: 'NO', identity_generation: null,
    },
  ]);

  const primaryKey = await pool.query(`
    SELECT kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      USING (constraint_catalog, constraint_schema, constraint_name,
             table_catalog, table_schema, table_name)
    WHERE tc.table_schema = current_schema() AND tc.table_name = 'reservas'
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position
  `);
  assert.deepEqual(primaryKey.rows, [{ column_name: 'id' }]);
});

test('parâmetros preservam apóstrofo e conteúdo SQL como texto', async () => {
  await withTransaction(async (client) => {
    const cliente = "D'Ávila'); DROP TABLE reservas; --";
    const { rows: [inserted] } = await client.query(insertSql, [cliente, '2026-10-15', 'pendente']);
    assert.ok(Number.isInteger(inserted.id) && inserted.id > 0);
    assert.deepEqual(inserted, {
      id: inserted.id, cliente, data: '15-10-2026', status: 'pendente',
    });
    const { rows } = await client.query('SELECT cliente FROM reservas WHERE id = $1', [inserted.id]);
    assert.deepEqual(rows, [{ cliente }]);
  });
});

test('linha confirmada é lida por uma segunda conexão real', async () => {
  const writer = await pool.connect();
  let reader;
  let insertedId;
  try {
    const { rows: [inserted] } = await writer.query(insertSql, [
      'Teste T06 de nova conexão', '2026-10-15', 'confirmada',
    ]);
    insertedId = inserted.id;
    const writerPid = await writer.query('SELECT pg_backend_pid() AS pid');
    // Manter writer ocupado força pool.connect() a obter outro backend.
    reader = await pool.connect();
    const readerPid = await reader.query('SELECT pg_backend_pid() AS pid');
    assert.notEqual(readerPid.rows[0].pid, writerPid.rows[0].pid);
    const { rows } = await reader.query(`
      SELECT id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status
      FROM reservas WHERE id = $1
    `, [insertedId]);
    assert.deepEqual(rows, [inserted]);
  } finally {
    reader?.release();
    try {
      if (insertedId !== undefined) {
        await writer.query('DELETE FROM reservas WHERE id = $1', [insertedId]);
      }
    } finally {
      writer.release();
    }
  }
});

test('DATE mantém dia, mês e ano na leitura explícita DD-MM-YYYY', async () => {
  await withTransaction(async (client) => {
    for (const [internalDate, externalDate] of [
      ['0001-01-01', '01-01-0001'],
      ['2024-02-29', '29-02-2024'],
      ['2026-10-15', '15-10-2026'],
      ['9999-12-31', '31-12-9999'],
    ]) {
      const { rows: [inserted] } = await client.query(insertSql, [
        'Teste T06 de data civil', internalDate, 'pendente',
      ]);
      assert.equal(inserted.data, externalDate);
      const { rows: [stored] } = await client.query(`
        SELECT to_char(data, 'YYYY-MM-DD') AS data, pg_typeof(data)::text AS tipo
        FROM reservas WHERE id = $1
      `, [inserted.id]);
      assert.deepEqual(stored, { data: internalDate, tipo: 'date' });
    }
  });
});

test('reaplicar o schema preserva uma linha existente e seu ID', async () => {
  await withTransaction(async (client) => {
    const { rows: [inserted] } = await client.query(insertSql, [
      'Teste T06 de idempotência', '2026-10-15', 'cancelada',
    ]);
    await applySchema(client);
    const { rows } = await client.query(`
      SELECT id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status
      FROM reservas WHERE id = $1
    `, [inserted.id]);
    assert.deepEqual(rows, [inserted]);
  });
});

for (const [column, index] of [['cliente', 0], ['data', 1], ['status', 2]]) {
  test(`NOT NULL rejeita ${column} ausente`, async () => {
    await withTransaction(async (client) => {
      const values = ['Teste T06 de obrigatórios', '2026-10-15', 'pendente'];
      values[index] = null;
      await assert.rejects(client.query(insertSql, values), { code: '23502', column });
    });
  });
}

for (const [description, value] of [['vazio', ''], ['somente espaços', '   ']]) {
  test(`CHECK rejeita cliente ${description}`, async () => {
    await withTransaction(async (client) => {
      await assert.rejects(client.query(insertSql, [value, '2026-10-15', 'pendente']), {
        code: '23514',
      });
    });
  });
}

test('VARCHAR(120) aceita exatamente 120 caracteres Unicode', async () => {
  await withTransaction(async (client) => {
    const cliente = '🧪'.repeat(120);
    const { rows: [inserted] } = await client.query(insertSql, [cliente, '2026-10-15', 'pendente']);
    assert.equal(inserted.cliente, cliente);
  });
});

test('VARCHAR(120) rejeita cliente com 121 caracteres', async () => {
  await withTransaction(async (client) => {
    await assert.rejects(client.query(insertSql, ['a'.repeat(121), '2026-10-15', 'pendente']), {
      code: '22001',
    });
  });
});

test('CHECK rejeita status fora da lista aprovada', async () => {
  await withTransaction(async (client) => {
    await assert.rejects(client.query(insertSql, ['Teste T06 de status', '2026-10-15', 'invalido']), {
      code: '23514',
    });
  });
});

test('DATE rejeita dia impossível no calendário', async () => {
  await withTransaction(async (client) => {
    await assert.rejects(client.query(insertSql, ['Teste T06 de data inválida', '2025-02-29', 'pendente']), {
      code: '22008',
    });
  });
});

test('GENERATED ALWAYS rejeita ID informado manualmente', async () => {
  await withTransaction(async (client) => {
    await assert.rejects(client.query(`
      INSERT INTO reservas (id, cliente, data, status)
      VALUES ($1, $2, $3::date, $4)
    `, [2147483647, 'Teste T06 de identidade', '2026-10-15', 'pendente']), {
      code: '428C9',
    });
  });
});
