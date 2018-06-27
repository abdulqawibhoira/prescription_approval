const jwt = require('jsonwebtoken');
const config = require('../configs');

exports.generateJWTToken = (tokenData) => {
    const accessToken = jwt.sign(tokenData, config.get("jwt.secretKey"), { expiresIn: config.get("jwt.expiresIn") });
    const decoded = jwt.decode(accessToken, { complete: true });
    const expiryAt = decoded.payload.exp;
    return { accessToken, expiryAt };
};