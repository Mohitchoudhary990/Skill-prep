const router = require('express').Router();
const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/', async (req, res) => {
    try {
        const { data } = await axios.post(`${ML_URL}/roadmap`, req.body);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'ML service error', details: err.message });
    }
});

module.exports = router;
