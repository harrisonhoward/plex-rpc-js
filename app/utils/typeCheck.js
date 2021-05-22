module.exports = {
    /**
     * @returns {boolean}
     */
    isEmptyString: str => {
        return (
            !str
            || (typeof str === "string" && str.length <= 0)
        );
    },
    /**
     * @returns {boolean} 
     */
    isEmptyArray: arr => {
        return (
            Array.isArray(arr)
            && arr.length == 0
        );
    },
    /**
     * @returns {boolean} 
     */
    isNumber: num => {
        return !isNaN(num);
    },
    /**
     * @returns {boolean} 
     */
    isBoolean: bool => {
        return (
            typeof bool === "string"
                ? bool.toLowerCase() == "true" || bool.toLowerCase() == "false"
                : bool == "true" || bool == "false"
        );
    },
    /**
     * @returns {boolean} 
     */
    convertToBoolean: str => {
        return (
            typeof str === "string"
                ? ["y", "n", "yes", "no"].includes(str.toLowerCase())
                    ? str.toLowerCase() == "y" || str.toLowerCase() == "yes" // Execute twice, result is the same
                    : str.toLowerCase() == "true"
                : str == "true"
        );
    }
};