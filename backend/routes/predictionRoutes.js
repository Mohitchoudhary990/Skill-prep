const router = require('express').Router();
const { predict, getPredictions, getLatestPrediction } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

// All prediction routes require authentication
router.use(protect);

router.post('/', predict);            // POST /api/predictions
router.get('/', getPredictions);      // GET  /api/predictions?page=1&limit=10
router.get('/latest', getLatestPrediction); // GET /api/predictions/latest

module.exports = router;
