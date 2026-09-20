const { v4: uuidv4 } = require('uuid');

/**
 * Middleware that assigns a unique X-Request-ID header to every incoming HTTP request.
 * Useful for debugging, tracing API calls across logs, and performance monitoring.
 */
const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = requestLogger;
