import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

const appDirectory = fileURLToPath(new URL('../../', import.meta.url));

export async function startNativeApi(port) {
  if (port === undefined) {
    const probe = createServer().listen(0, '127.0.0.1');
    await once(probe, 'listening');
    port = probe.address().port;
    await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  }
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: appDirectory, env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // Promessa sempre resolvida: falhas de spawn não geram rejeição sem consumidor.
  const exited = new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }));
    child.once('error', () => resolve({ code: null, signal: 'spawn-error' }));
  });
  const stop = async () => {
    let timer;
    let forced = false;
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    try {
      timer = setTimeout(() => { forced = true; child.kill('SIGKILL'); }, 5000);
      const result = await exited;
      assert.equal(forced, false, 'API deve encerrar sem SIGKILL.');
      assert.deepEqual(result, { code: 0, signal: null }, 'API deve encerrar com código 0.');
      return result;
    } finally {
      clearTimeout(timer);
    }
  };
  child.stderr.resume();
  try {
    await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('API nativa não iniciou dentro de 5s.')), 5000);
      child.once('error', () => { clearTimeout(timer); reject(new Error('Falha ao iniciar processo nativo.')); });
      child.once('exit', () => { clearTimeout(timer); reject(new Error('Processo nativo encerrou antes de iniciar.')); });
      child.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes(`API de reservas escutando na porta ${port}.`)) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  } catch (error) {
    try { await stop(); } catch { /* Falha de início já será reportada. */ }
    throw error;
  }
  return { baseUrl: `http://127.0.0.1:${port}`, port, pid: child.pid, stop };
}
