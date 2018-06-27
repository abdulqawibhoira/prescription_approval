
const mongoQuery = require('../mongoHelper/queries.js');
const constants = require('../constants.js');
const APIError = require('../misc/APIError.js');
const successResponse = require('../misc/successResponse.js');
const tokenHelper = require('../misc/tokenHelper.js');

const userLogin = async (ctx, next) => {
    const filter = { username: ctx.request.body.username, password: ctx.request.body.password };
    const userDetails = await mongoQuery.findOne(constants.COLLECTION_USERS, filter, {});
    if (!userDetails) {
        throw new APIError(400, "Invalid Username Or Password");
    }
    userDetails.accessTokenDetails = tokenHelper.generateJWTToken({ userId: userDetails['_id'].toString() });
    ctx.body = successResponse({ userDetails });
}

module.exports = { userLogin };