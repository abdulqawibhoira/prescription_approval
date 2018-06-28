
const ObjectID = require('mongodb').ObjectID;


/**
 * This function check for all required fields in an object
 * @param {Array} requiredArray array of fields
 * @param {Object} validateObject object to validate
 */
const validateRequired = (requiredArray, validateObject) => {
    for (const param of requiredArray) {
        if (!validateObject[param]) {
            return { isValidated: 0, message: `${param} Required` };
        }
    }
    return { isValidated: 1, message: "OK" };
};

/**
 * This function validates Mongo Object Ids given in a input
 * @param {Array} idArray array of Ids
 */
const validateObjectIds = (idArray) => {
    for (const id of idArray) {
        if (!ObjectID.isValid(id)) {
            return false;
        }
    }
    return true;
};

module.exports = { validateRequired, validateObjectIds };