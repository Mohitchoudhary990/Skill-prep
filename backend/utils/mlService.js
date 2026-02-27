const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Send academic features to the FastAPI ML microservice and get placement prediction.
 * @param {Object} features – academic data object
 * @returns {Promise<Object>} ML prediction response
 */
const getPrediction = async (features) => {
    try {
        const { data } = await axios.post(`${ML_URL}/predict`, features, {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' },
        });
        return data;
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            throw new Error('ML service is unavailable. Please try again later.');
        }
        throw new Error(err.response?.data?.detail || err.message || 'ML service error');
    }
};

/**
 * Get skill gap analysis from the ML service.
 * @param {Object} payload – { skills, targetRole }
 */
const getSkillGap = async (payload) => {
    try {
        const { data } = await axios.post(`${ML_URL}/skill-gap`, payload, { timeout: 15000 });
        return data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || err.message || 'ML service error');
    }
};

/**
 * Generate learning roadmap from the ML service.
 * @param {Object} payload – { targetRole, currentSkills, timeAvailable }
 */
const getRoadmap = async (payload) => {
    try {
        const { data } = await axios.post(`${ML_URL}/roadmap`, payload, { timeout: 20000 });
        return data;
    } catch (err) {
        throw new Error(err.response?.data?.detail || err.message || 'ML service error');
    }
};

module.exports = { getPrediction, getSkillGap, getRoadmap };
