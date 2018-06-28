const request = require('supertest');
const config = require('../app/configs');
const assert = require('assert');

const approvalApiRequest = request(`http://localhost:${config.get('port')}/v1`);

describe('Doctor Should be able to view prescription if approved by user', () => {
    var doctorDetails, doctorBDetails, patienDetailDetails, prescriptionId, doctorAccessToken, doctorBAccessToken, patientAccesstoken;
    it('should create a dummy doctor - Doctor A', () => {
        return approvalApiRequest
            .post('/user')
            .send({
                "username": "Doctor A",
                "password": "1234",
                "role": "doctor"
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                doctorDetails = response.body.data.user;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should create a dummy doctor - Doctor B', () => {
        return approvalApiRequest
            .post('/user')
            .send({
                "username": "Doctor B",
                "password": "1234",
                "role": "doctor"
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                doctorBDetails = response.body.data.user;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should create a dummy patient - patient 2', () => {
        return approvalApiRequest
            .post('/user')
            .send({
                "username": "patient 2",
                "password": "1234",
                "role": "patient"
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                patienDetailDetails = response.body.data.user;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should create a dummy prescription for the patient 2', () => {
        return approvalApiRequest
            .post('/prescriptions')
            .send({
                "prescriptionTitle": "patient 2 prescription",
                "prescriptionDate": 20180101,
                "prescriptionDescription": "Long, very long description",
                "prescriptionOtherDetails": {},
                "userid": patienDetailDetails['_id']
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                prescriptionId = response.body.data.prescription['_id'];
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should login with "doctor A" credentials', () => {
        return approvalApiRequest
            .post('/user/login')
            .send({
                "username": doctorDetails.username,
                "password": doctorDetails.password
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                doctorAccessToken = response.body.data.userDetails.accessTokenDetails.accessToken;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('Doctor A Request for the approval from the patient to view above created Prescription', () => {
        return approvalApiRequest
            .post(`/requestApproval`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorAccessToken)
            .send({
                "prescriptionId": prescriptionId
            })
            .expect(200)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should login with "doctor B" credentials', () => {
        return approvalApiRequest
            .post('/user/login')
            .send({
                "username": doctorBDetails.username,
                "password": doctorBDetails.password
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                doctorBAccessToken = response.body.data.userDetails.accessTokenDetails.accessToken;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('Doctor B Request for the approval from the patient to view above created Prescription', () => {
        return approvalApiRequest
            .post(`/requestApproval`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorBAccessToken)
            .send({
                "prescriptionId": prescriptionId
            })
            .expect(200)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should login with the "patient 2" credentials', () => {
        return approvalApiRequest
            .post('/user/login')
            .send({
                "username": patienDetailDetails.username,
                "password": patienDetailDetails.password
            })
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                patientAccesstoken = response.body.data.userDetails.accessTokenDetails.accessToken;
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('patient should get 2 or more Pending approval requests', () => {
        return approvalApiRequest
            .get('/requestApproval/pending')
            .set('Accept', 'application/json')
            .set('Authorization', patientAccesstoken)
            .expect(200)
            .then(response => {
                assert(response.body.data.pendingApprovalList.length >= 2, "patient do not have 2 or more Pending approval requests");
            }).catch(err => {
                assert.fail(err);
            });
    });
});