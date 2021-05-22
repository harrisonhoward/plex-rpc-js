/**
 * @typedef {object} CONFIG
 * @property {string} ADDRESS
 * @property {number} [PORT]
 * @property {string} USERNAME
 * @property {string} TOKEN
 * @property {boolean} HTTPS
 * @property {string[]} CHECKUSERS
 * @property {function} toPlexAPI
 */

/**
 * @returns {CONFIG}
 */
module.exports = () => {
    // Convert the string representing an array into an array
    let checkUsers;
    try {
        checkUsers = JSON.parse(process.env.CHECKUSERS);
    } catch (err) {
    }
    return {
        ADDRESS: process.env.ADDRESS || "",
        PORT: process.env.PORT || undefined,
        USERNAME: process.env.USER || "",
        TOKEN: process.env.TOKEN || "",
        HTTPS: process.env.HTTPS == "true",
        CHECKUSERS: Array.isArray(checkUsers) ? checkUsers : [],
        /**
         * @returns {object}
         */
        toPlexAPI: () => {
            return {
                hostname: process.env.ADDRESS || "",
                port: process.env.PORT || undefined,
                username: process.env.USER || "",
                token: process.env.TOKEN || "",
                https: process.env.HTTPS == "true"
            };
        }
    };
};