const prompt = require("../utils/prompt");
const { isEmptyString, isEmptyArray, isNumber, isBoolean, convertToBoolean } = require("../utils/typeCheck");

/**
 * @param {import("../config").CONFIG} CONFIG 
 */
module.exports = CONFIG => {
    console.clear(); // Clear console every start
    console.log("Details were invalid, follow the prompts\n")
    console.log("Type \"exit\" anytime to exit the application.");
    console.log("Any options with \"*\" are required. To skip non require options enter nothing.\n");

    const address = prompt("IP Address*: ");
    const port = prompt("Port: ");
    const username = prompt("Username*: ");
    const token = prompt("Token*: ");
    const https = prompt("Use https (\"y\" for yes): ");
    let checkUsers = prompt("Check for users (seperated by \",\"): ").replace(/\,/g, ",").split(",");
    if (isEmptyString(checkUsers[0])) { // Removes the empty '' from the array
        checkUsers = [];
    }

    if (!isEmptyString(address)
        && !isEmptyString(username)
        && !isEmptyString(token)) {
        process.env.ADDRESS = address;
        process.env.USER = username;
        process.env.TOKEN = token;
        process.env.HTTPS = convertToBoolean(https);

        if (isNumber(port)) {
            process.env.PORT = port;
        }
        if (!isEmptyArray(checkUsers)) {
            process.env.CHECKUSERS = `[${checkUsers.map(str => `"${str}"`).join(", ")}]`;
        }
    }
}