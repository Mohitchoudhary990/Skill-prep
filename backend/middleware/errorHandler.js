/**
 * Global error handler middleware.
 * Must be registered LAST in the Express middleware stack.
 */
const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ─── Mongoose: CastError (bad ObjectId) ───────────────────────────────────
    if (err.name === 'CastError') {
        message = `Resource not found – invalid id: ${err.value}`;
        statusCode = 404;
    }

    // ─── Mongoose: Duplicate key ───────────────────────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field '${field}'. Please use a different value.`;
        statusCode = 400;
    }

    // ─── Mongoose: Validation error ───────────────────────────────────────────
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(', ');
        statusCode = 400;
    }

    // ─── JWT errors ───────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    // ─── CORS error ───────────────────────────────────────────────────────────
    if (err.message && err.message.startsWith('CORS policy')) {
        statusCode = 403;
    }

    if (process.env.NODE_ENV === 'development') {
        console.error('[ERROR]', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
