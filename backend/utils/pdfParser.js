const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract raw text from a PDF file on disk.
 * @param {string} filePath – absolute path to the PDF
 * @returns {Promise<string>} extracted text
 */
const extractTextFromPdf = async (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
};

module.exports = { extractTextFromPdf };
