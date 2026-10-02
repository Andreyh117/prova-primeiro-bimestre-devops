import express from 'express';
import { HttpError, errorHandler } from './errors.js';
import { parseId, validateReserva } from './validation.js';

const columns = "id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status";

export function createApp(pool) {
  const app = express();
  app.disable('x-powered-by');

  const jsonBody = [(req, res, next) => {
    if (!req.is('application/json')) {
      return next(new HttpError(415, 'TIPO_NAO_SUPORTADO', 'Use Content-Type application/json.'));
    }
    next();
  }, express.json({ limit: '16kb', strict: true })];

  app.post('/reservas', ...jsonBody, async (req, res) => {
    const reserva = validateReserva(req.body);
    const { rows: [created] } = await pool.query(`
      INSERT INTO public.reservas (cliente, data, status)
      VALUES ($1, $2::date, $3) RETURNING ${columns}
    `, [reserva.cliente, reserva.data, reserva.status]);
    res.location(`/reservas/${created.id}`).status(201).json(created);
  });

  app.get('/reservas', async (req, res) => {
    const { rows } = await pool.query(`SELECT ${columns} FROM public.reservas ORDER BY id ASC`);
    res.json(rows);
  });

  app.get('/reservas/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const { rows: [reserva] } = await pool.query(`
      SELECT ${columns} FROM public.reservas WHERE id = $1
    `, [id]);
    if (!reserva) throw new HttpError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
    res.json(reserva);
  });

  app.put('/reservas/:id', (req, res, next) => {
    res.locals.reservaId = parseId(req.params.id);
    next();
  }, ...jsonBody, async (req, res) => {
    const reserva = validateReserva(req.body);
    const { rows: [updated] } = await pool.query(`
      UPDATE public.reservas SET cliente = $1, data = $2::date, status = $3
      WHERE id = $4 RETURNING ${columns}
    `, [reserva.cliente, reserva.data, reserva.status, res.locals.reservaId]);
    if (!updated) throw new HttpError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
    res.json(updated);
  });

  app.delete('/reservas/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const { rowCount } = await pool.query('DELETE FROM public.reservas WHERE id = $1 RETURNING id', [id]);
    if (!rowCount) throw new HttpError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
    res.status(204).end();
  });

  app.get('/health', async (req, res) => {
    let deadline;
    res.set('Cache-Control', 'no-store');
    try {
      // O limite total também abrange espera por conexão. A consulta é somente leitura.
      await Promise.race([
        pool.query({ text: 'SELECT 1', query_timeout: 2000 }),
        new Promise((resolve, reject) => {
          deadline = setTimeout(() => reject(new Error('Prazo de saúde excedido.')), 2000);
        }),
      ]);
      res.json({ status: 'ok', database: 'ok' });
    } catch {
      res.status(503).json({ status: 'unavailable', database: 'unavailable' });
    } finally {
      clearTimeout(deadline);
    }
  });

  app.use((req, res, next) => next(new HttpError(404, 'ROTA_NAO_ENCONTRADA', 'Rota não encontrada.')));
  app.use(errorHandler);
  return app;
}
