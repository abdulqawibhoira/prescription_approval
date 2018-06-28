const controllers = require('../controllers');
const router = new require('koa-router')();
const authenticate = require('../middlewares/authenticate.js');


//Login API
router.post('/user/login', controllers.users.userLogin);

// Prescription View Approval 
router.post('/requestApproval', authenticate.authenticateUser(true), authenticate.isNotPatient, controllers.approval.requestApproval);

// Accept/Reject Prescription View Approval
router.patch('/requestApproval/:requestApprovalId', authenticate.authenticateUser(true), controllers.approval.updateStatus);

// List user's pending approvals
router.get('/requestApproval/pending', authenticate.authenticateUser(true), controllers.approval.pendingApprovalList);

// Get Patient's Medical records / prescription By prescription Id 
router.get('/prescriptions/:prescriptionId', authenticate.authenticateUser(true), controllers.prescription.getById);

// Get Patient's all approved Medical records / prescriptions
router.get('/prescriptions/user/:userid', authenticate.authenticateUser(true), controllers.prescription.getByUserId);


// Extra APIs to add test users and prescriptions. These APIs are only used to ADD test records. 
// How and when these records are added is not covered in assignment.
router.post('/prescriptions', controllers.prescription.create);

router.post('/user', controllers.users.create);

module.exports = router;
