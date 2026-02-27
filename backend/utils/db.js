const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10s timeout
        });
        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌  MongoDB connection FAILED');
        console.error('    Error:', err.message);
        console.error('    Code :', err.code || 'N/A');
        console.error('    Fixes: (1) Atlas Network Access → Allow 0.0.0.0/0');
        console.error('           (2) Atlas Database Access → verify user + password');
        console.error('           (3) Check MONGO_URI has correct cluster hostname');
        // Don't exit on connection failure — server stays up so errors are visible
    }
};

// Log on disconnect / reconnect
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅  MongoDB reconnected.');
});

module.exports = connectDB;
