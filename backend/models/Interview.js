const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    category: {
        type: String,
        enum: ['technical', 'behavioral', 'hr', 'domain', 'aptitude'],
        default: 'technical',
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    userAnswer: { type: String },
    aiEvaluation: {
        score: { type: Number, min: 0, max: 10 },
        feedback: { type: String },
        modelAnswer: { type: String },
        improvements: [String],
    },
    answeredAt: { type: Date },
});

const InterviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume',
        },
        title: { type: String, default: 'Mock Interview Session' },
        jobRole: { type: String, required: true },
        techStack: [{ type: String }],
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        questions: [QuestionSchema],
        sessionStatus: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'abandoned'],
            default: 'pending',
        },
        // Aggregate Results
        overallScore: { type: Number, min: 0, max: 10 },
        totalQuestions: { type: Number, default: 0 },
        answeredQuestions: { type: Number, default: 0 },
        performanceSummary: { type: String },
        strengths: [String],
        areasToImprove: [String],
        completedAt: { type: Date },
    },
    { timestamps: true }
);

InterviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', InterviewSchema);
