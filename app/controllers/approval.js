
const mongoQuery = require('../mongoHelper/queries.js');
const constants = require('../constants.js');
const APIError = require('../misc/APIError.js');
const successResponse = require('../misc/successResponse.js');
const util = require('../misc/util.js');
const ObjectID = require('mongodb').ObjectID;

const requestApproval = async (ctx, next) => {
    const { isValidated, message } = util.validateRequired(['prescriptionId'], ctx.request.body);
    if (!isValidated) {
        throw new APIError(400, message);
    }
    const approvalData = await getApprovalRecordData(ctx);
    const approval = await mongoQuery.create(constants.COLLECTION_APPROVALS, approvalData);
    ctx.body = successResponse({ message: "Prescription Approval Request Sent to user" });
};

const updateStatus = async (ctx, next) => {

};

const pendingList = async (ctx, next) => {

};

const getApprovalRecordData = async (ctx) => {
    const [prescriptionDetails, requestedByUserDetails] = await Promise.all([
        getPrescriptionDetails(ctx),
        getRequestedByUserDetails(ctx)
    ]);
    return {
        prescriptionDetails,
        requestedByUserDetails,
        approvalStatus: constants.APPROVAL_STATUS_PENDING
    }
};

const getPrescriptionDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.request.body.prescriptionId) }
    const prescriptionDetails = await mongoQuery.findOne(constants.COLLECTION_PRESCRIPTIONS, filter, {});
    if (!prescriptionDetails) {
        throw new APIError(400, "Invalid prescription id");
    }
    return prescriptionDetails;
};

const getRequestedByUserDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.user.userId) }
    return await mongoQuery.findOne(constants.COLLECTION_USERS, filter, {});
};

module.exports = { requestApproval, updateStatus, pendingList };