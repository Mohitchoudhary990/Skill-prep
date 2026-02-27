const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [80, 'Name cannot exceed 80 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // never return password by default
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        // Academic Info
        cgpa: { type: Number, min: 0, max: 10 },
        branch: { type: String, trim: true },
        college: { type: String, trim: true },
        graduationYear: { type: Number },
        skills: [{ type: String, trim: true }],
        // Profile
        avatar: { type: String },
        linkedIn: { type: String },
        github: { type: String },
        isProfileComplete: { type: Boolean, default: false },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);

// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare password ───────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// ─── Virtual: full profile completion check ───────────────────────────────────
UserSchema.methods.checkProfileComplete = function () {
    return !!(this.cgpa && this.branch && this.college && this.graduationYear);
};

module.exports = mongoose.model('User', UserSchema);
