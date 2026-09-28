import { createApp } from './app.js';
import { createDatabasePool, DatabaseConfigurationError } from './db.js';

const portText = process.env.PORT ?? '3000';
const port = Number(portText);
let pool;
let server;

try {
  if (portText.length === 0 || /[^0-9]/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new DatabaseConfigurationError('PORT deve ser uma porta de 1 a 65535.');
  }
  pool = createDatabasePool();
  server = createApp(pool).listen(port, '0.0.0.0', () => {
    console.log(`API de reservas escutando na porta ${port}.`);
  });
  server.once('error', async () => {
    console.error('Não foi possível iniciar o servidor HTTP.');
    process.exitCode = 1;
    await pool.end();
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => { await pool.end(); });
    });
  }
} catch (error) {
  console.error(error instanceof DatabaseConfigurationError ? error.message : 'Falha ao iniciar a API.');
  process.exitCode = 1;
  await pool?.end();
}
