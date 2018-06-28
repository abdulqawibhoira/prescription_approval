const request = require('supertest');
const config = require('../app/configs');
const assert = require('assert');

const approvalApiRequest = request(`http://localhost:${config.get('port')}/v1`);

describe('Doctor should be able to view prescription if approved by user', () => {
    var doctorDetails, patienDetailDetails, prescriptionId, doctorAccessToken, patientAccesstoken, approvalId;
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
    it('should create a dummy patient - patient 1', () => {
        return approvalApiRequest
            .post('/user')
            .send({
                "username": "patient 1",
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
    it('should create a dummy prescription for the patient 1', () => {
        return approvalApiRequest
            .post('/prescriptions')
            .send({
                "prescriptionTitle": "patient 1 prescription",
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
    it('Doctor A try to access Patients Prescription Without approval. API should return 403 - Forbiddon', () => {
        return approvalApiRequest
            .get(`/prescriptions/${prescriptionId}`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorAccessToken)
            .expect(403)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('Doctor A Request for the approval from the patient to view above Prescription', () => {
        return approvalApiRequest
            .post(`/requestApproval`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorAccessToken)
            .send({
                "prescriptionId": prescriptionId
            })
            .expect(200)
            .then(response => {
                approvalId = response.body.data.approvalData['_id']
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('Doctor A Again Request for the approval from the patient to view same Prescription. API should throw 400 - Bad request', () => {
        return approvalApiRequest
            .post(`/requestApproval`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorAccessToken)
            .send({
                "prescriptionId": prescriptionId
            })
            .expect(400)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('should login with the "patient 1" credentials', () => {
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
    it("Patient 1 approves Doctor A's request", () => {
        return approvalApiRequest
            .patch(`/requestApproval/${approvalId}`)
            .set('Accept', 'application/json')
            .set('Authorization', patientAccesstoken)
            .send({
                "status": "approved"
            })
            .expect(200)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
    it('Again Doctor A try to access Patients Prescription. API should now return detailed prescription of a user', () => {
        return approvalApiRequest
            .get(`/prescriptions/${prescriptionId}`)
            .set('Accept', 'application/json')
            .set('Authorization', doctorAccessToken)
            .expect(200)
            .then(response => {
                assert(true);
            }).catch(err => {
                assert.fail(err);
            });
    });
});