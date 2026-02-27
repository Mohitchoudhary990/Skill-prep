/**
 * Standardised API response helpers.
 * Keeps all controllers consistent and DRY.
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, statusCode = 500, message = 'Server Error', errors = null) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    res.status(statusCode).json(body);
};

const sendPaginated = (res, data, page, limit, total) => {
    res.status(200).json({
        success: true,
        count: data.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data,
    });
};

module.exports = { sendSuccess, sendError, sendPaginated };
