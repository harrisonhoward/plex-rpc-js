/**
 * @param {string} text 
 * @returns {string}
 */
module.exports = text => {
    console.log(require("moment")().format('DD/MM/YY h:mma') + " -", text);
};