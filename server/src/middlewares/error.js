export function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Not Found - ${req.originalUrl}`))
}

export function errorHandler(err, req, res, _next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({ message: err.message || 'Server Error' })
}
