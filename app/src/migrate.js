import { createDatabasePool, DatabaseConfigurationError } from './db.js';
import { applySchema } from './schema.js';

let pool;
try {
  pool = createDatabasePool();
  await applySchema(pool);
  console.log('Schema de reservas aplicado com sucesso.');
} catch (error) {
  console.error(error instanceof DatabaseConfigurationError
    ? error.message
    : 'Falha ao aplicar schema; confira a configuração e a disponibilidade do PostgreSQL.');
  process.exitCode = 1;
} finally {
  await pool?.end();
}
