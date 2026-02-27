const mongoose = require('mongoose');

const PlacementPredictionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Input snapshot sent TO the ML service
        inputFeatures: {
            cgpa: { type: Number, required: true },
            branch: { type: String, required: true },
            internships: { type: Number, default: 0 },
            projects: { type: Number, default: 0 },
            certifications: { type: Number, default: 0 },
            backlogs: { type: Number, default: 0 },
            skillCount: { type: Number, default: 0 },
            communicationScore: { type: Number, min: 1, max: 10 },
            aptitudeScore: { type: Number, min: 0, max: 100 },
            technicalScore: { type: Number, min: 0, max: 100 },
            extraCurriculars: { type: Number, default: 0 },
            collegiateActivities: { type: Number, default: 0 },
        },
        // Output returned BY the ML service
        placementProbability: { type: Number, min: 0, max: 1 }, // 0.0 – 1.0
        placementPercentage: { type: Number, min: 0, max: 100 }, // derived
        confidence: { type: Number, min: 0, max: 1 },
        tier: {
            type: String,
            enum: ['high', 'medium', 'low'],
        },
        topFactors: [{ factor: String, impact: String }],
        recommendations: [String],
        rawMlResponse: { type: mongoose.Schema.Types.Mixed },
        mlModelVersion: { type: String },
    },
    { timestamps: true }
);

PlacementPredictionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PlacementPrediction', PlacementPredictionSchema);
