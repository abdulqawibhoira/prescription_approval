const jwt = require('jsonwebtoken');
const fs = require('fs');
const APIError = require('../misc/APIError.js');
const config = require('../configs');

const authenticateUser = (required = false) => {
	return async (ctx, next) => {
		let accessToken = ctx.request.headers.authorization;
		if (required && !accessToken) {
			throw new APIError(401, "Invalid access token");
			return;
		}
		if (accessToken) {
			try {
				const tokenDetails = jwt.verify(accessToken, config.get('jwt.secretKey'));
				ctx.user = tokenDetails;
			} catch (e) {
				throw new APIError(401, e.message);
			}
		}
		await next();
	}
};

module.exports = { authenticateUser };
