const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Core Gemini API call.
 * @param {string} prompt
 * @returns {Promise<string>} Generated text
 */
const callGemini = async (prompt) => {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const { data } = await axios.post(
        `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`,
        {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        },
        { timeout: 30000 }
    );

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');
    return text;
};

/**
 * Parse JSON from Gemini response (handles markdown code blocks).
 */
const parseGeminiJSON = (text) => {
    // Strip markdown code fences if present
    const clean = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
};

// ─── 1. Analyse Resume ────────────────────────────────────────────────────────
/**
 * @param {string} resumeText – raw text extracted from PDF
 * @returns {Promise<Object>} analysis result
 */
const analyseResume = async (resumeText) => {
    const prompt = `You are an expert career counsellor and ATS system. Analyse the following resume text and return a JSON object with EXACTLY these fields:
{
  "overallScore": <number 0-100>,
  "atsCompatibilityScore": <number 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "suggestions": [<string>, ...],
  "extractedSkills": [<string>, ...],
  "extractedExperience": [<string>, ...],
  "extractedProjects": [<string>, ...],
  "keywords": [<string>, ...],
  "summary": "<one paragraph summary of the candidate>"
}

Resume Text:
${resumeText.substring(0, 6000)}

Return ONLY the JSON object, no extra text.`;

    const text = await callGemini(prompt);
    return parseGeminiJSON(text);
};

// ─── 2. Generate Mock Interview Questions ─────────────────────────────────────
/**
 * @param {Object} options – { jobRole, techStack, difficulty, resumeText, count }
 * @returns {Promise<Array>} array of question objects
 */
const generateInterviewQuestions = async ({ jobRole, techStack = [], difficulty = 'medium', resumeText = '', count = 10 }) => {
    const techList = techStack.join(', ') || 'General';
    const prompt = `You are an expert technical interviewer at a top tech company. Generate ${count} mock interview questions for a ${difficulty}-level ${jobRole} position.

Tech Stack: ${techList}
${resumeText ? `Candidate Resume Context (first 1000 chars): ${resumeText.substring(0, 1000)}` : ''}

Return a JSON array with EXACTLY this structure:
[
  {
    "question": "<question text>",
    "category": "<technical|behavioral|hr|domain|aptitude>",
    "difficulty": "<easy|medium|hard>"
  },
  ...
]

Mix question types: 60% technical, 20% behavioral, 10% HR, 10% domain-specific.
Return ONLY the JSON array, no extra text.`;

    const text = await callGemini(prompt);
    return parseGeminiJSON(text);
};

// ─── 3. Evaluate Interview Answer ─────────────────────────────────────────────
/**
 * @param {Object} options – { question, userAnswer, jobRole }
 * @returns {Promise<Object>} evaluation result
 */
const evaluateAnswer = async ({ question, userAnswer, jobRole = 'Software Engineer' }) => {
    const prompt = `You are an expert ${jobRole} interviewer. Evaluate the following interview answer and return a JSON object with EXACTLY these fields:
{
  "score": <number 0-10>,
  "feedback": "<detailed feedback on the answer>",
  "modelAnswer": "<an ideal model answer>",
  "improvements": [<specific improvement suggestions as strings>]
}

Question: ${question}
Candidate's Answer: ${userAnswer || '(No answer provided)'}

Be constructive, specific, and helpful. Return ONLY the JSON object.`;

    const text = await callGemini(prompt);
    return parseGeminiJSON(text);
};

module.exports = { analyseResume, generateInterviewQuestions, evaluateAnswer };
