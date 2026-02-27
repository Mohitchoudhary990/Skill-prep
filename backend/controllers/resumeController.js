const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const { extractTextFromPdf } = require('../utils/pdfParser');
const { analyseResume } = require('../utils/aiService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ─── POST /api/resumes/upload ─────────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 400, 'No file uploaded – please attach a PDF');
        }

        const resume = await Resume.create({
            user: req.user._id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            status: 'uploaded',
        });

        return sendSuccess(res, 201, 'Resume uploaded successfully', { resume });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/resumes/:id/analyse ───────────────────────────────────────────
const analyseResumeById = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!resume) {
            return sendError(res, 404, 'Resume not found');
        }

        // Set processing flag
        resume.status = 'processing';
        await resume.save();

        // Extract text from PDF
        let rawText = '';
        try {
            rawText = await extractTextFromPdf(resume.filePath);
        } catch {
            resume.status = 'error';
            resume.errorMessage = 'Failed to extract text from PDF';
            await resume.save();
            return sendError(res, 422, 'Could not extract text from PDF');
        }

        if (!rawText.trim()) {
            resume.status = 'error';
            resume.errorMessage = 'PDF appears to be empty or image-based';
            await resume.save();
            return sendError(res, 422, 'PDF appears to be empty or image-based – please upload a text-based PDF');
        }

        // Call AI analysis
        let analysis;
        try {
            analysis = await analyseResume(rawText);
        } catch (aiErr) {
            resume.status = 'error';
            resume.errorMessage = aiErr.message;
            await resume.save();
            return sendError(res, 502, `AI analysis failed: ${aiErr.message}`);
        }

        resume.rawText = rawText;
        resume.analysis = analysis;
        resume.status = 'analysed';
        await resume.save();

        return sendSuccess(res, 200, 'Resume analysed successfully', { resume });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/resumes ─────────────────────────────────────────────────────────
const getResumes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id, isActive: true };
        const [resumes, total] = await Promise.all([
            Resume.find(query).select('-rawText').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Resume.countDocuments(query),
        ]);

        return sendPaginated(res, resumes, page, limit, total);
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/resumes/:id ─────────────────────────────────────────────────────
const getResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return sendError(res, 404, 'Resume not found');
        return sendSuccess(res, 200, 'Resume fetched', { resume });
    } catch (err) {
        next(err);
    }
};

// ─── DELETE /api/resumes/:id ──────────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return sendError(res, 404, 'Resume not found');

        // Soft delete
        resume.isActive = false;
        await resume.save();

        // Delete physical file
        if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        return sendSuccess(res, 200, 'Resume deleted');
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadResume, analyseResumeById, getResumes, getResume, deleteResume };
