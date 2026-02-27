const rateLimit = require('express-rate-limit');

/** General API limiter – 100 requests per 15 minutes */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests – please try again later' },
});

/** Strict limiter for auth endpoints – 10 requests per 15 minutes */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts – please try again in 15 minutes' },
});

/** AI endpoints – 20 requests per 15 minutes (expensive) */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'AI request limit reached – please wait before sending more requests' },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
