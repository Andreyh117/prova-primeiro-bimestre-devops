const networkErrors = new Set([
  'ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'EHOSTUNREACH',
  'ENETUNREACH', 'ENOTFOUND', 'EAI_AGAIN',
]);
const databaseErrors = new Set(['57P01', '57P02', '57P03', '53300', '57014']);
const driverErrors = new Set([
  'Query read timeout', 'timeout expired', 'timeout exceeded when trying to connect',
  'Connection terminated', 'Connection terminated unexpectedly',
  'Connection terminated due to connection timeout',
]);

function databaseUnavailable(error) {
  return networkErrors.has(error.code) || databaseErrors.has(error.code)
    || (typeof error.code === 'string' && error.code.startsWith('08'))
    || driverErrors.has(error.message);
}

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof URIError) {
    error = new HttpError(400, 'ENTRADA_INVALIDA', 'O caminho deve ter codificação válida.');
  } else if (error.type === 'entity.parse.failed') {
    error = new HttpError(400, 'ENTRADA_INVALIDA', 'O corpo deve ser um objeto JSON válido.');
  } else if (error.type === 'entity.too.large') {
    error = new HttpError(413, 'CORPO_EXCESSIVO', 'O corpo deve ter no máximo 16 KiB.');
  } else if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
    error = new HttpError(415, 'TIPO_NAO_SUPORTADO', 'A codificação do corpo não é suportada.');
  }

  if (!(error instanceof HttpError) && databaseUnavailable(error)) {
    error = new HttpError(503, 'BANCO_INDISPONIVEL', 'Banco de dados indisponível.');
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ erro: { codigo: error.code, mensagem: error.message } });
  }
  console.error('Falha inesperada ao processar requisição.');
  return res.status(500).json({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Não foi possível processar a requisição.' } });
}
