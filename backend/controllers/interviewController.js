const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { generateInterviewQuestions, evaluateAnswer } = require('../utils/aiService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ─── POST /api/interviews/generate ───────────────────────────────────────────
const generateSession = async (req, res, next) => {
    try {
        const { jobRole, techStack, difficulty, resumeId, count } = req.body;

        if (!jobRole) return sendError(res, 400, 'jobRole is required');

        // Optionally pull resume text for context-aware questions
        let resumeText = '';
        if (resumeId) {
            const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
            if (resume) resumeText = resume.rawText || '';
        }

        const rawQuestions = await generateInterviewQuestions({
            jobRole,
            techStack: techStack || [],
            difficulty: difficulty || 'medium',
            resumeText,
            count: count || 10,
        });

        const session = await Interview.create({
            user: req.user._id,
            resume: resumeId || undefined,
            jobRole,
            techStack: techStack || [],
            difficulty: difficulty || 'medium',
            title: `${jobRole} Mock Interview`,
            questions: rawQuestions.map((q) => ({
                question: q.question,
                category: q.category,
                difficulty: q.difficulty,
            })),
            totalQuestions: rawQuestions.length,
            sessionStatus: 'in-progress',
        });

        return sendSuccess(res, 201, 'Interview session generated', { session });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/interviews/:id/answer ─────────────────────────────────────────
const submitAnswer = async (req, res, next) => {
    try {
        const { questionIndex, answer } = req.body;

        if (answer === undefined || questionIndex === undefined) {
            return sendError(res, 400, 'questionIndex and answer are required');
        }

        const session = await Interview.findOne({ _id: req.params.id, user: req.user._id });
        if (!session) return sendError(res, 404, 'Interview session not found');
        if (session.sessionStatus === 'completed') {
            return sendError(res, 400, 'This session is already completed');
        }

        const question = session.questions[questionIndex];
        if (!question) return sendError(res, 400, 'Invalid question index');

        // Evaluate with AI
        const evaluation = await evaluateAnswer({
            question: question.question,
            userAnswer: answer,
            jobRole: session.jobRole,
        });

        session.questions[questionIndex].userAnswer = answer;
        session.questions[questionIndex].aiEvaluation = evaluation;
        session.questions[questionIndex].answeredAt = new Date();
        session.answeredQuestions = session.questions.filter((q) => q.userAnswer).length;

        await session.save();

        return sendSuccess(res, 200, 'Answer submitted and evaluated', {
            questionIndex,
            evaluation,
            progress: {
                answered: session.answeredQuestions,
                total: session.totalQuestions,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/interviews/:id/complete ───────────────────────────────────────
const completeSession = async (req, res, next) => {
    try {
        const session = await Interview.findOne({ _id: req.params.id, user: req.user._id });
        if (!session) return sendError(res, 404, 'Interview session not found');

        const answeredQs = session.questions.filter((q) => q.aiEvaluation?.score !== undefined);
        const totalScore = answeredQs.reduce((sum, q) => sum + (q.aiEvaluation?.score || 0), 0);
        const overallScore = answeredQs.length > 0 ? (totalScore / answeredQs.length).toFixed(2) : 0;

        // Aggregate feedback
        const allFeedback = answeredQs.flatMap((q) => q.aiEvaluation?.improvements || []);
        const uniqueFeedback = [...new Set(allFeedback)].slice(0, 5);

        session.sessionStatus = 'completed';
        session.overallScore = parseFloat(overallScore);
        session.areasToImprove = uniqueFeedback;
        session.completedAt = new Date();
        session.performanceSummary = `Completed ${answeredQs.length}/${session.totalQuestions} questions with an average score of ${overallScore}/10.`;
        await session.save();

        return sendSuccess(res, 200, 'Session completed', { session });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/interviews ──────────────────────────────────────────────────────
const getInterviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id };
        if (req.query.status) query.sessionStatus = req.query.status;

        const [sessions, total] = await Promise.all([
            Interview.find(query)
                .select('-questions')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Interview.countDocuments(query),
        ]);

        return sendPaginated(res, sessions, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/interviews/:id ──────────────────────────────────────────────────
const getInterview = async (req, res, next) => {
    try {
        const session = await Interview.findOne({ _id: req.params.id, user: req.user._id });
        if (!session) return sendError(res, 404, 'Interview session not found');
        return sendSuccess(res, 200, 'Interview session fetched', { session });
    } catch (err) {
        next(err);
    }
};

module.exports = { generateSession, submitAnswer, completeSession, getInterviews, getInterview };
