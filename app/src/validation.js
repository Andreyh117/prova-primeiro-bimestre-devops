import { HttpError } from './errors.js';

function invalid(message) {
  throw new HttpError(400, 'ENTRADA_INVALIDA', message);
}

export function parseId(text) {
  const id = Number(text);
  if (text.length === 0 || /[^0-9]/.test(text) || !Number.isInteger(id) || id < 1 || id > 2147483647) {
    invalid('id deve ser um inteiro de 1 a 2147483647.');
  }
  return id;
}

function civilDateToSql(text) {
  if (typeof text !== 'string' || text.length !== 10 || !/^\d{2}-\d{2}-\d{4}$/.test(text)) {
    invalid('data deve estar no formato DD-MM-YYYY.');
  }
  const [dayText, monthText, yearText] = text.split('-');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
    invalid('data deve existir no calendário, com ano de 0001 a 9999.');
  }
  return `${yearText}-${monthText}-${dayText}`;
}

export function validateReserva(body) {
  const fields = ['cliente', 'data', 'status'];
  if (body === null || typeof body !== 'object' || Array.isArray(body)
      || Object.keys(body).length !== fields.length || !fields.every((field) => Object.hasOwn(body, field))) {
    invalid('Informe exatamente cliente, data e status, todos obrigatórios.');
  }
  if (typeof body.cliente !== 'string') invalid('cliente deve ser uma string.');
  const cliente = body.cliente.trim();
  if (cliente.includes('\0') || !cliente.isWellFormed()) {
    invalid('cliente deve conter texto Unicode válido, sem caractere NUL.');
  }
  const length = [...cliente].length;
  if (length < 1 || length > 120) {
    invalid('cliente deve conter entre 1 e 120 caracteres após remover espaços externos.');
  }
  if (!['pendente', 'confirmada', 'cancelada'].includes(body.status)) {
    invalid('status deve ser pendente, confirmada ou cancelada.');
  }
  return { cliente, data: civilDateToSql(body.data), status: body.status };
}
