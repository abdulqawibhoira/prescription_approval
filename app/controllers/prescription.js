
const mongoQuery = require('../mongoHelper/queries.js');
const constants = require('../constants.js');
const APIError = require('../misc/APIError.js');
const successResponse = require('../misc/successResponse.js');
const util = require('../misc/util.js');
const ObjectID = require('mongodb').ObjectID;

const getById = async (ctx, next) => {
    if (!util.validateObjectIds([ctx.params.prescriptionId])) {
        throw new APIError(400, "Invalid Prescription Id");
    }
    const filter = {
        '_id': new ObjectID(ctx.params.prescriptionId),
        approvedUserIds: new ObjectID(ctx.user.userId)
    }
    const prescriptionDetails = await mongoQuery.findOne(constants.COLLECTION_PRESCRIPTIONS, { filter });
    if (!prescriptionDetails) {
        throw new APIError(403, "You are not allowed to view this prescription");
    }
    ctx.body = successResponse({ prescriptionDetails });
};

const getByUserId = async (ctx, next) => {
    if (!util.validateObjectIds([ctx.params.userId])) {
        throw new APIError(400, "Invalid Approval Id");
    }
    const filter = {
        'userid': new ObjectID(ctx.params.userId),
        approvedUserIds: new ObjectID(ctx.user.userId)
    };
    const userPerscriptions = await mongoQuery.findAll(constants.COLLECTION_PRESCRIPTIONS, { filter });
    ctx.body = successResponse({ userPerscriptions });
};

const create = async (ctx, next) => {
    ctx.request.body.userid = new ObjectID(ctx.request.body.userid);
    const result = await mongoQuery.create(constants.COLLECTION_PRESCRIPTIONS, ctx.request.body);
    ctx.body = successResponse({ message: "Prescription Added" });
};

module.exports = { getById, getByUserId, create };