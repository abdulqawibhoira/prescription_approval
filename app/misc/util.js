
const ObjectID = require('mongodb').ObjectID;

const validateRequired = (requiredArray, validateObject) => {
    for (const param of requiredArray) {
        if (!validateObject[param]) {
            return { isValidated: 0, message: `${param} Required` };
        }
    }
    return { isValidated: 1, message: "OK" };
};

const validateObjectIds = (idArray) => {
    for (const id of idArray) {
        if (!ObjectID.isValid(id)) {
            return false;
        }
    }
    return true;
};

module.exports = { validateRequired, validateObjectIds };