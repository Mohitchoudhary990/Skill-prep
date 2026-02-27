const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes – verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return sendError(res, 401, 'Not authorised – no token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return sendError(res, 401, 'Not authorised – user not found');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 401, 'Token expired – please log in again');
        }
        return sendError(res, 401, 'Not authorised – invalid token');
    }
};

/**
 * Restrict route to specific roles
 * Usage: authorize('admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `Role '${req.user.role}' is not authorised to access this route`
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
