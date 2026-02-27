const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileSize: { type: Number }, // bytes
        mimeType: { type: String, default: 'application/pdf' },

        // Extracted & Analysed Content
        rawText: { type: String },
        analysis: {
            overallScore: { type: Number, min: 0, max: 100 },
            strengths: [String],
            weaknesses: [String],
            suggestions: [String],
            extractedSkills: [String],
            extractedExperience: [String],
            extractedProjects: [String],
            atsCompatibilityScore: { type: Number, min: 0, max: 100 },
            keywords: [String],
            summary: { type: String },
        },

        status: {
            type: String,
            enum: ['uploaded', 'processing', 'analysed', 'error'],
            default: 'uploaded',
        },
        errorMessage: { type: String },
        isActive: { type: Boolean, default: true }, // soft delete
    },
    { timestamps: true }
);

// Index for fast user-specific queries
ResumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
