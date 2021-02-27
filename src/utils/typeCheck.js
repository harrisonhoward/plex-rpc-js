module.exports = {
    /**
     * @returns {Boolean}
     */
    isEmptyString: str => {
        if (!str
            || (typeof str === "string" && str.length <= 0)) {
            return true;
        }
        return false;
    },
    /**
     * @returns {Boolean}
     */
    isNotEmptyString: str => {
        if (str && str.length > 0) {
            return true;
        }
        return false;
    },
    /**
     * @returns {Boolean} 
     */
    isNotEmptyArray: arr => {
        if (Array.isArray(arr)
            && arr.length > 0
            && require("./typeCheck").isNotEmptyString(arr[0])) {
            return true;
        }
        return false;
    },
    /**
     * @returns {Boolean} 
     */
    isNumber: num => {
        if (parseInt(num)) {
            return true;
        }
        return false;
    }
};