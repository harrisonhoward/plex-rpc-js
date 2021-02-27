const prompt = require("prompt-sync")();

/**
 * @param {string} text
 * @returns {string} 
 */
module.exports = (text) => {
    if (typeof text === "string") {
        const response = prompt(text);
        if (response === null
            || (typeof response === "string" && response === "exit")) {
            process.exit(0);
        } else {
            return response;
        }
    }
};