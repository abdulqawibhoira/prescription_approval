
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
    if (!util.validateObjectIds([ctx.request.body.prescriptionId])) {
        throw new APIError(400, "Invalid Prescription Id");
    }
    if (await checkIsApprovalAlreadyRequested(ctx)) {
        throw new APIError(400, "Approval Already Requested");
    }
    const approvalData = await getApprovalRecordData(ctx);
    const approval = await mongoQuery.create(constants.COLLECTION_APPROVALS, approvalData);
    ctx.body = successResponse({ message: "Prescription approval request sent to user" });
};

const updateStatus = async (ctx, next) => {
    if (!util.validateObjectIds([ctx.params.requestApprovalId])) {
        throw new APIError(400, "Invalid Approval Id");
    }
    if (!isValidStatus(ctx.request.body.status)) {
        throw new APIError(400, "Invalid Status");
    }
    const requestedApprovalDetails = await getRequestedApprovalDetails(ctx);
    if (!IsApprovalBelongsToUser(requestedApprovalDetails, ctx.user.userId)) {
        throw new APIError(403, "Forbidden Resource");
    }
    await updateApprovalStatus(ctx);
    if (ctx.request.body.status === constants.APPROVAL_STATUS_APPROVED) {
        await addToPrescriptionsApprovedUserIds(requestedApprovalDetails);
    }
    ctx.body = successResponse({ message: `Prescription approval request ${ctx.request.body.status}` });
};

const pendingApprovalList = async (ctx, next) => {
    const filter = {
        'prescriptionDetails.userid': new ObjectID(ctx.user.userId),
        approvalStatus: constants.APPROVAL_STATUS_PENDING
    };
    const pendingApprovalList = await mongoQuery.findAll(constants.COLLECTION_APPROVALS, { filter });
    ctx.body = successResponse({ pendingApprovalList })
};

const checkIsApprovalAlreadyRequested = async (ctx) => {
    const filter = {
        'prescriptionDetails._id': new ObjectID(ctx.request.body.prescriptionId),
        'requestedByUserDetails._id': new ObjectID(ctx.user.userId)
    };
    return await mongoQuery.findOne(constants.COLLECTION_APPROVALS, { filter });
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
    const filter = { '_id': new ObjectID(ctx.request.body.prescriptionId) };
    const project = { prescriptionTitle: 1, prescriptionDate: 1, userid: 1 };
    const prescriptionDetails = await mongoQuery.findOne(constants.COLLECTION_PRESCRIPTIONS, { filter, project });
    if (!prescriptionDetails) {
        throw new APIError(400, "Invalid prescription id");
    }
    return prescriptionDetails;
};

const getRequestedByUserDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.user.userId) };
    const project = { username: 1 };
    return await mongoQuery.findOne(constants.COLLECTION_USERS, { filter, project });
};

const getRequestedApprovalDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.params.requestApprovalId) }
    const requestedApprovalDetails = await mongoQuery.findOne(constants.COLLECTION_APPROVALS, { filter });
    if (!requestedApprovalDetails) {
        throw new APIError(400, "Invalid approval id");
    }
    return requestedApprovalDetails;
};

const isValidStatus = (status) => {
    return (status === constants.APPROVAL_STATUS_APPROVED || status === constants.APPROVAL_STATUS_REJECTED);
};

const IsApprovalBelongsToUser = (requestedApprovalDetails, userId) => {
    return requestedApprovalDetails.prescriptionDetails["userid"].toString() === userId;
};

const updateApprovalStatus = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.params.requestApprovalId) };
    const updateData = { "$set": { approvalStatus: ctx.request.body.status } };
    await mongoQuery.update(constants.COLLECTION_APPROVALS, filter, updateData);
};

const addToPrescriptionsApprovedUserIds = async (requestedApprovalDetails) => {
    const filter = { '_id': requestedApprovalDetails.prescriptionDetails["_id"] };
    const updateData = { "$addToSet": { approvedUserIds: requestedApprovalDetails.requestedByUserDetails["_id"] } };
    await mongoQuery.update(constants.COLLECTION_PRESCRIPTIONS, filter, updateData);
};

module.exports = { requestApproval, updateStatus, pendingApprovalList };