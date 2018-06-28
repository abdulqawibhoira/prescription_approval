const jwt = require('jsonwebtoken');
const fs = require('fs');
const APIError = require('../misc/APIError.js');
const config = require('../configs');
const constants = require('../constants.js');

/** 
 * This function returns a middleware function which authenticates the user.
 * @param {boolean} required Boolean parameter to check if access token is required or optional (if false) to access particular API
 * 
 * middleware function verfies user's accesstoken passed in Authorization Header.
 * middleware function sends 401 if access token is expired or invalid
 * 
 * */ 
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

// This Middleware checks role of an authenticated user . If user is patient, It throws 401 http status code
const isNotPatient = async (ctx, next) => {
	if (ctx.user.role == constants.ROLE_PATIENT) {
		throw new APIError(401, "You are not allowed to send approval request");
		return;
	}
	await next();
};

module.exports = { authenticateUser, isNotPatient };
