
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
    // Filter for a given ID as well as if this user is allowed to access this prescription
    const filter = {
        '_id': new ObjectID(ctx.params.prescriptionId),
        approvedUserIds: new ObjectID(ctx.user.userId)
    };
    const prescriptionDetails = await mongoQuery.findOne(constants.COLLECTION_PRESCRIPTIONS, { filter, project: getPrescriptionFields() });
    if (!prescriptionDetails) {
        throw new APIError(403, "You are not allowed to view this prescription");
    }
    ctx.body = successResponse({ prescriptionDetails });
};

const getByUserId = async (ctx, next) => {
    if (!util.validateObjectIds([ctx.params.userid])) {
        throw new APIError(400, "Invalid User Id");
    }
    // Filter for a given user ID and and prescription allowed to access to this user
    const filter = {
        'userid': new ObjectID(ctx.params.userid),
        approvedUserIds: new ObjectID(ctx.user.userId)
    };
    const userPerscriptions = await mongoQuery.findAll(constants.COLLECTION_PRESCRIPTIONS, { filter, project: getPrescriptionFields() });
    ctx.body = successResponse({ userPerscriptions });
};

const create = async (ctx, next) => {
    ctx.request.body.userid = new ObjectID(ctx.request.body.userid);
    const result = await mongoQuery.create(constants.COLLECTION_PRESCRIPTIONS, ctx.request.body);
    ctx.body = successResponse({ prescription: ctx.request.body });
};

const getPrescriptionFields = () => {
    return { prescriptionTitle: 1, prescriptionDate: 1, prescriptionDescription: 1, prescriptionOtherDetails: 1 };
};

module.exports = { getById, getByUserId, create };