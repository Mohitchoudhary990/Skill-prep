const router = require('express').Router();
const {
    uploadResume,
    analyseResumeById,
    getResumes,
    getResume,
    deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// All resume routes require authentication
router.use(protect);

router.get('/', getResumes);
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/:id', getResume);
router.post('/:id/analyse', aiLimiter, analyseResumeById);
router.delete('/:id', deleteResume);

module.exports = router;
