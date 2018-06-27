const controllers = require('../controllers');
const router = new require('koa-router')();
const authenticate = require('../middlewares/authenticate.js');


//Login API
router.post('/user/login', controllers.users.userLogin);

// Prescription View Approval 
router.post('/requestApproval', authenticate.authenticateUser(true), authenticate.isNotPatient, controllers.approval.requestApproval);

// Accept/Reject Prescription View Approval
router.patch('/requestApproval/:requestApprovalId', authenticate.authenticateUser(true), controllers.approval.updateStatus);

// List patient's pending approvals
router.get('/requestApproval/pending', authenticate.authenticateUser(true), controllers.approval.pendingList);

//get Patient's Medical records / prescription
router.get('/prescriptions/:prescriptionId', authenticate.authenticateUser(true), controllers.prescription.get);

module.exports = router;
