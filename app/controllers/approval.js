
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
    // Check If approval aready requested by User
    if (await checkIsApprovalAlreadyRequested(ctx)) {
        throw new APIError(400, "Approval Already Requested");
    }
    const approvalData = await getApprovalRecordData(ctx);
    // Add new Approval Details in a database 
    const approval = await mongoQuery.create(constants.COLLECTION_APPROVALS, approvalData);
    ctx.body = successResponse({ message: "Prescription approval request sent to user" });
};

const updateStatus = async (ctx, next) => {
    if (!util.validateObjectIds([ctx.params.requestApprovalId])) {
        throw new APIError(400, "Invalid Approval Id");
    }
    // Check if valid status is passed in a request body
    if (!isValidStatus(ctx.request.body.status)) {
        throw new APIError(400, "Invalid Status");
    }
    const requestedApprovalDetails = await getRequestedApprovalDetails(ctx);
    // Check if Prescription Requested for approval belongs to this authenticated user  
    if (!IsApprovalBelongsToUser(requestedApprovalDetails, ctx.user.userId)) {
        throw new APIError(403, "Forbidden Resource");
    }
    // update approval status
    await updateApprovalStatus(ctx);
    // If approved, Add userid of a user who requested for approval in prescription's allowedUsers List
    if (ctx.request.body.status === constants.APPROVAL_STATUS_APPROVED) {
        await addToPrescriptionsApprovedUserIds(requestedApprovalDetails);
    }
    ctx.body = successResponse({ message: `Prescription approval request ${ctx.request.body.status}` });
};

const pendingApprovalList = async (ctx, next) => {
    // Check for all the pending approvals of a user 
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
        'requestedByUserDetails._id': new ObjectID(ctx.user.userId),
        approvalStatus: { '$ne': constants.APPROVAL_STATUS_REJECTED }
    };
    return await mongoQuery.findOne(constants.COLLECTION_APPROVALS, { filter });
};

const getApprovalRecordData = async (ctx) => {
    // Get Prescription Details And  User Details of a user who requested to insert into approval collection
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

// Get Prescription Details By Id
const getPrescriptionDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.request.body.prescriptionId) };
    const project = { prescriptionTitle: 1, prescriptionDate: 1, userid: 1 };
    const prescriptionDetails = await mongoQuery.findOne(constants.COLLECTION_PRESCRIPTIONS, { filter, project });
    if (!prescriptionDetails) {
        throw new APIError(400, "Invalid prescription id");
    }
    return prescriptionDetails;
};

// Get User Details By Id
const getRequestedByUserDetails = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.user.userId) };
    const project = { username: 1 };
    return await mongoQuery.findOne(constants.COLLECTION_USERS, { filter, project });
};

// Get Requested Approval Details By Id
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

// This function generates required filter and update paramaters for a mongo query to update status
const updateApprovalStatus = async (ctx) => {
    const filter = { '_id': new ObjectID(ctx.params.requestApprovalId) };
    const updateData = { "$set": { approvalStatus: ctx.request.body.status } };
    await mongoQuery.update(constants.COLLECTION_APPROVALS, filter, updateData);
};

// This function generates required filter and update paramaters for a mongo query to add userid in prescription's allwed user list
const addToPrescriptionsApprovedUserIds = async (requestedApprovalDetails) => {
    const filter = { '_id': requestedApprovalDetails.prescriptionDetails["_id"] };
    const updateData = { "$addToSet": { approvedUserIds: requestedApprovalDetails.requestedByUserDetails["_id"] } };
    await mongoQuery.update(constants.COLLECTION_PRESCRIPTIONS, filter, updateData);
};

module.exports = { requestApproval, updateStatus, pendingApprovalList };