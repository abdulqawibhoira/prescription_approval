function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

//Database Collection Names 
define("COLLECTION_USERS", "users");
define("COLLECTION_APPROVALS", "approvals");
define("COLLECTION_PRESCRIPTIONS", "prescriptions");

//Approval status
define("APPROVAL_STATUS_PENDING", "pending");
define("APPROVAL_STATUS_APPROVED", "approved");
define("APPROVAL_STATUS_REJECTED", "rejected");

//Roles
define("ROLE_DOCTOR", "doctor");
define("ROLE_PHARMACIST", "pharmacist");
define("ROLE_PATIENT", "patient");
