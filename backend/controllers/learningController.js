const LearningProgress = require('../models/LearningProgress');
const { getSkillGap, getRoadmap } = require('../utils/mlService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── GET /api/learning/progress ───────────────────────────────────────────────
const getProgress = async (req, res, next) => {
    try {
        let progress = await LearningProgress.findOne({ user: req.user._id });

        if (!progress) {
            // Auto-create on first access
            progress = await LearningProgress.create({ user: req.user._id });
        }

        return sendSuccess(res, 200, 'Learning progress fetched', { progress });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/learning/roadmap ───────────────────────────────────────────────
const generateRoadmap = async (req, res, next) => {
    try {
        const { targetRole, currentSkills, timeAvailable } = req.body;
        if (!targetRole) return sendError(res, 400, 'targetRole is required');

        let roadmapData;
        try {
            roadmapData = await getRoadmap({
                targetRole,
                currentSkills: currentSkills || req.user.skills || [],
                timeAvailable: timeAvailable || '8 weeks',
            });
        } catch (mlErr) {
            return sendError(res, 502, mlErr.message);
        }

        let progress = await LearningProgress.findOne({ user: req.user._id });
        if (!progress) {
            progress = new LearningProgress({ user: req.user._id });
        }

        progress.roadmap = {
            generatedAt: new Date(),
            jobRole: targetRole,
            description: roadmapData.description || '',
            estimatedDuration: roadmapData.estimated_duration || timeAvailable,
            topics: (roadmapData.topics || []).map((t) => ({
                name: t.name || t,
                category: t.category || '',
                resourceLinks: t.resources || [],
            })),
        };
        await progress.save();

        return sendSuccess(res, 200, 'Roadmap generated', { progress });
    } catch (err) {
        next(err);
    }
};

// ─── PATCH /api/learning/topics/:topicId ─────────────────────────────────────
const updateTopicStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        if (!['not-started', 'in-progress', 'completed'].includes(status)) {
            return sendError(res, 400, 'status must be not-started, in-progress, or completed');
        }

        const progress = await LearningProgress.findOne({ user: req.user._id });
        if (!progress) return sendError(res, 404, 'No learning progress found');

        const topic = progress.roadmap?.topics?.id(req.params.topicId);
        if (!topic) return sendError(res, 404, 'Topic not found');

        topic.status = status;
        if (status === 'completed') topic.completedAt = new Date();
        if (notes) topic.notes = notes;

        // Award XP for completion
        if (status === 'completed') {
            progress.xp += 50;
            progress.level = Math.floor(progress.xp / 500) + 1;
        }

        await progress.save(); // triggers pre-save hook for completionPercentage

        return sendSuccess(res, 200, 'Topic status updated', {
            topic,
            completionPercentage: progress.completionPercentage,
            xp: progress.xp,
            level: progress.level,
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/learning/skill-gap ─────────────────────────────────────────────
const analyseSkillGap = async (req, res, next) => {
    try {
        const { targetRole, currentSkills } = req.body;
        if (!targetRole) return sendError(res, 400, 'targetRole is required');

        let skillGapData;
        try {
            skillGapData = await getSkillGap({
                targetRole,
                skills: currentSkills || req.user.skills || [],
            });
        } catch (mlErr) {
            return sendError(res, 502, mlErr.message);
        }

        // Persist result
        let progress = await LearningProgress.findOne({ user: req.user._id });
        if (!progress) {
            progress = new LearningProgress({ user: req.user._id });
        }

        progress.skillGapAnalysis = {
            targetRole,
            currentSkills: currentSkills || req.user.skills || [],
            missingSkills: skillGapData.missing_skills || [],
            recommendedResources: skillGapData.recommended_resources || [],
            analysedAt: new Date(),
        };
        await progress.save();

        return sendSuccess(res, 200, 'Skill gap analysed', {
            skillGapAnalysis: progress.skillGapAnalysis,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProgress, generateRoadmap, updateTopicStatus, analyseSkillGap };
