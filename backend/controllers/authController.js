const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation failed', errors.array());
        }

        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return sendError(res, 400, 'An account with this email already exists');
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        return sendSuccess(res, 201, 'Registration successful', {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendError(res, 400, 'Validation failed', errors.array());
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return sendError(res, 401, 'Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        return sendSuccess(res, 200, 'Login successful', {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                cgpa: user.cgpa,
                branch: user.branch,
                skills: user.skills,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        return sendSuccess(res, 200, 'User profile fetched', { user });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const allowedFields = [
            'name', 'cgpa', 'branch', 'college', 'graduationYear',
            'skills', 'linkedIn', 'github', 'avatar',
        ];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        // Auto-mark profile complete
        if (user.checkProfileComplete()) {
            user.isProfileComplete = true;
            await user.save({ validateBeforeSave: false });
        }

        return sendSuccess(res, 200, 'Profile updated', { user });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!(await user.matchPassword(currentPassword))) {
            return sendError(res, 401, 'Current password is incorrect');
        }
        if (newPassword.length < 6) {
            return sendError(res, 400, 'New password must be at least 6 characters');
        }

        user.password = newPassword;
        await user.save();

        return sendSuccess(res, 200, 'Password changed successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
