// Load environment variables
require("dotenv").config({ path: process.cwd() + "/process.env" });

const CONFIG = require("./config");
const writeEnv = require("./utils/writeEnv");
const { isEmptyString, isEmptyArray } = require("./utils/typeCheck");

const sections = {
    getUserInfo: require("./sections/getUserInfo"),
    beginRPC: require("./sections/beginRPC")
}

// Executing the CONFIG function everytime ensures that it has updated
// with any changes that occured from getUserInfo
while (isEmptyString(CONFIG().ADDRESS)
    || isEmptyString(CONFIG().USERNAME)
    || isEmptyString(CONFIG().TOKEN)
    || typeof CONFIG().HTTPS !== "boolean") {
    sections.getUserInfo(CONFIG());
    writeEnv(CONFIG());
}
sections.beginRPC(CONFIG());