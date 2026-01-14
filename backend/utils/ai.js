const logger = require("../config/logger");

/**
 * Safely extracts and parses JSON from a string that might contain Markdown code blocks.
 * @param {string} text - The text to parse.
 * @returns {object|null} - The parsed JSON object or null if parsing fails.
 */
const parseAiJson = (text) => {
    try {
        // Remove markdown code blocks if present
        const cleanJson = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        
        return JSON.parse(cleanJson);
    } catch (error) {
        logger.error(`Failed to parse AI JSON response: ${error.toString()} "Original text: ${text}`);
        return null;
    }
};

module.exports = {
    parseAiJson,
};
