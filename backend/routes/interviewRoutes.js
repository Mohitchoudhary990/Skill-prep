const router = require('express').Router();
const {
    generateSession,
    submitAnswer,
    completeSession,
    getInterviews,
    getInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// All interview routes require authentication
router.use(protect);

router.get('/', getInterviews);                            // GET  /api/interviews?status=completed&page=1
router.post('/generate', aiLimiter, generateSession);      // POST /api/interviews/generate
router.get('/:id', getInterview);                          // GET  /api/interviews/:id
router.post('/:id/answer', aiLimiter, submitAnswer);       // POST /api/interviews/:id/answer
router.post('/:id/complete', completeSession);             // POST /api/interviews/:id/complete

module.exports = router;
