const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String }, // e.g. "Data Structures", "System Design"
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started',
    },
    completedAt: { type: Date },
    resourceLinks: [{ title: String, url: String }],
    notes: { type: String },
});

const LearningProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // one progress doc per user
        },
        roadmap: {
            generatedAt: { type: Date },
            jobRole: { type: String },
            description: { type: String },
            estimatedDuration: { type: String }, // e.g. "8 weeks"
            topics: [TopicSchema],
        },
        // Aggregate stats
        totalTopics: { type: Number, default: 0 },
        completedTopics: { type: Number, default: 0 },
        completionPercentage: { type: Number, default: 0 },
        streak: { type: Number, default: 0 }, // consecutive active days
        lastActiveDate: { type: Date },
        // Skill Gap Analysis
        skillGapAnalysis: {
            targetRole: { type: String },
            currentSkills: [String],
            missingSkills: [String],
            recommendedResources: [{ skill: String, resource: String, link: String }],
            analysedAt: { type: Date },
        },
        // XP gamification
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ name: String, awardedAt: Date }],
    },
    { timestamps: true }
);

// Auto-update completionPercentage before save
LearningProgressSchema.pre('save', function (next) {
    if (this.roadmap && this.roadmap.topics) {
        this.totalTopics = this.roadmap.topics.length;
        this.completedTopics = this.roadmap.topics.filter(
            (t) => t.status === 'completed'
        ).length;
        this.completionPercentage =
            this.totalTopics > 0
                ? Math.round((this.completedTopics / this.totalTopics) * 100)
                : 0;
    }
    next();
});

LearningProgressSchema.index({ user: 1 });

module.exports = mongoose.model('LearningProgress', LearningProgressSchema);
