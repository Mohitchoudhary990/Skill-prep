const PlacementPrediction = require('../models/PlacementPrediction');
const { getPrediction } = require('../utils/mlService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ─── POST /api/predictions ────────────────────────────────────────────────────
const predict = async (req, res, next) => {
    try {
        const {
            cgpa, branch, internships, projects, certifications,
            backlogs, skillCount, communicationScore, aptitudeScore,
            technicalScore, extraCurriculars, collegiateActivities,
        } = req.body;

        // Basic validation
        if (cgpa === undefined || !branch) {
            return sendError(res, 400, 'cgpa and branch are required');
        }

        const inputFeatures = {
            cgpa: parseFloat(cgpa),
            branch,
            internships: parseInt(internships) || 0,
            projects: parseInt(projects) || 0,
            certifications: parseInt(certifications) || 0,
            backlogs: parseInt(backlogs) || 0,
            skillCount: parseInt(skillCount) || 0,
            communicationScore: parseFloat(communicationScore) || 5,
            aptitudeScore: parseFloat(aptitudeScore) || 50,
            technicalScore: parseFloat(technicalScore) || 50,
            extraCurriculars: parseInt(extraCurriculars) || 0,
            collegiateActivities: parseInt(collegiateActivities) || 0,
        };

        // Call FastAPI ML service
        let mlResult;
        try {
            mlResult = await getPrediction(inputFeatures);
        } catch (mlErr) {
            return sendError(res, 502, mlErr.message);
        }

        // Determine tier
        const prob = mlResult.placement_probability || mlResult.probability || 0;
        const tier = prob >= 0.7 ? 'high' : prob >= 0.4 ? 'medium' : 'low';

        const prediction = await PlacementPrediction.create({
            user: req.user._id,
            inputFeatures,
            placementProbability: prob,
            placementPercentage: Math.round(prob * 100),
            confidence: mlResult.confidence || null,
            tier,
            topFactors: mlResult.top_factors || [],
            recommendations: mlResult.recommendations || [],
            rawMlResponse: mlResult,
            mlModelVersion: mlResult.model_version || 'v1',
        });

        return sendSuccess(res, 201, 'Placement prediction generated', { prediction });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/predictions ─────────────────────────────────────────────────────
const getPredictions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id };
        const [predictions, total] = await Promise.all([
            PlacementPrediction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            PlacementPrediction.countDocuments(query),
        ]);

        return sendPaginated(res, predictions, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/predictions/latest ─────────────────────────────────────────────
const getLatestPrediction = async (req, res, next) => {
    try {
        const prediction = await PlacementPrediction.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        if (!prediction) return sendError(res, 404, 'No predictions found – please run a prediction first');
        return sendSuccess(res, 200, 'Latest prediction fetched', { prediction });
    } catch (err) {
        next(err);
    }
};

module.exports = { predict, getPredictions, getLatestPrediction };
