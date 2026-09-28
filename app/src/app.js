import express from 'express';
import { HttpError, errorHandler } from './errors.js';
import { parseId, validateReserva } from './validation.js';

const columns = "id, cliente, to_char(data, 'DD-MM-YYYY') AS data, status";

export function createApp(pool) {
  const app = express();
  app.disable('x-powered-by');

  app.post('/reservas', (req, res, next) => {
    if (!req.is('application/json')) {
      return next(new HttpError(415, 'TIPO_NAO_SUPORTADO', 'Use Content-Type application/json.'));
    }
    next();
  }, express.json({ limit: '16kb', strict: true }), async (req, res) => {
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

  app.use((req, res, next) => next(new HttpError(404, 'ROTA_NAO_ENCONTRADA', 'Rota não encontrada.')));
  app.use(errorHandler);
  return app;
}
