export class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found`, errors: [] });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.statusCode || (err.code?.startsWith("P") ? 400 : 500);
  const message = err.statusCode ? err.message : "An unexpected server error occurred";
  res.status(status).json({
    success: false,
    message,
    errors: err.errors || [],
  });
}
