const prompt = require("./prompt");
const { isNotEmptyArray, isNotEmptyString, isNumber } = require("./typeCheck");

/**
 * @typedef {Object} PlexLoginDetails
 * @property {String} address
 * @property {Number} [port]
 * @property {Boolean} https
 * @property {String} username
 * @property {String} token
 * @property {String[]} [checkUsers=[]]
 */

/**
 * @param {PlexLoginDetails} plexLoginDetails
 * @returns {PlexLoginDetails | false}
 */
module.exports = (plexLoginDetails) => {
    console.log("Any options with \"*\" are required. Enter nothing to continue.");

    const address = prompt("IP Address*: ");
    const port = prompt("Port: ");
    const username = prompt("Username*: ");
    const token = prompt("Token*: ");
    const https = prompt("Use https (\"y\" for yes): ");
    const checkUsers = prompt("Check for users (seperated by \",\"): ").replace(/\, /g, ",").split(",");

    if (isNotEmptyString(address)
        && isNotEmptyString(username) && isNotEmptyString(token)) {
        plexLoginDetails.address = address;
        plexLoginDetails.username = username;
        plexLoginDetails.token = token;

        if (isNumber(port)) {
            plexLoginDetails.port = parseInt(port);
        }
        if (isNotEmptyString(https)
            && https.toLowerCase() === "y") {
            plexLoginDetails.https = true;
        }
        if (isNotEmptyArray(checkUsers)) {
            plexLoginDetails.checkUsers = checkUsers;
        }
        return plexLoginDetails;
    }
    return false;
}