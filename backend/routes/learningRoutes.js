const router = require('express').Router();
const {
    getProgress,
    generateRoadmap,
    updateTopicStatus,
    analyseSkillGap,
} = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// All learning routes require authentication
router.use(protect);

router.get('/progress', getProgress);                      // GET  /api/learning/progress
router.post('/roadmap', aiLimiter, generateRoadmap);       // POST /api/learning/roadmap
router.patch('/topics/:topicId', updateTopicStatus);       // PATCH /api/learning/topics/:topicId
router.post('/skill-gap', aiLimiter, analyseSkillGap);     // POST /api/learning/skill-gap

module.exports = router;
