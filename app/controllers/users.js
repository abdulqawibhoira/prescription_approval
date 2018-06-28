
const mongoQuery = require('../mongoHelper/queries.js');
const constants = require('../constants.js');
const APIError = require('../misc/APIError.js');
const successResponse = require('../misc/successResponse.js');
const tokenHelper = require('../misc/tokenHelper.js');

const userLogin = async (ctx, next) => {
    const filter = { username: ctx.request.body.username, password: ctx.request.body.password };
    const userDetails = await mongoQuery.findOne(constants.COLLECTION_USERS, { filter });
    if (!userDetails) {
        throw new APIError(400, "Invalid Username Or Password");
    }
    /** generate Access token on successful login. JWT is used to genarate access token.
    *   access token generated would be passed in "Authorization" header for all the requests which requires user's Authentication.
    *   User Id And Role is stored as a PAYLOAD data of an access token 
    */
    userDetails.accessTokenDetails = tokenHelper.generateJWTToken({ userId: userDetails['_id'].toString(), role: userDetails.role });
    ctx.body = successResponse({ userDetails });
}

const create = async (ctx, next) => {
    const result = await mongoQuery.create(constants.COLLECTION_USERS, ctx.request.body);
    ctx.body = successResponse({ user: ctx.request.body });
};

module.exports = { userLogin, create };