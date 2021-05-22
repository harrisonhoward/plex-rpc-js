const fs = require("fs");

/**
 * @param {import("../config").CONFIG} CONFIG 
 */
module.exports = CONFIG => {
    const lines = [
        `ADDRESS='${CONFIG.ADDRESS}'`,
        CONFIG.PORT ? `PORT=${CONFIG.PORT}` : `# PORT=6001`,
        `USER='${CONFIG.USERNAME}'`,
        `TOKEN='${CONFIG.TOKEN}'`,
        `HTTPS=${CONFIG.HTTPS}`,
        `CHECKUSERS=[${CONFIG.CHECKUSERS.map(str => `"${str}"`).join(", ")}]`,
    ];
    fs.writeFileSync(`${process.cwd()}/process.env`, lines.join("\n"));
}