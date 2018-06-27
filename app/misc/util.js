const validateRequired = (requiredArray, validateObject) => {
    for (const param of requiredArray) {
        if (!validateObject[param]) {
            return { isValidated: 0, message: `${param} Required` };
        }
    }
    return { isValidated: 1, message: "OK" };
};

module.exports = { validateRequired };