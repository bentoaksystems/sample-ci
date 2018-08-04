module.exports = class Patient {

  constructor(id, emr, emr_docs) {
    this.id = id;
    this.emr = emr;
    this.emrDocs = emr_docs;
  }

  async patientDataUpdated(payload) {
    if (!payload.id)
      throw new Error('There is no patient id');

    const PatientRepository = require('../../repositories/patientRepository');
    const patientRepository = new PatientRepository();
    const patient = {};

    ['firstname', 'surname', 'national_code', 'phone_number', 'title', 'mobile_number'].forEach(el => {
      if (payload[el])
        patient[el] = payload[el];
    });

    if (!Object.keys(patient).length)
      return Promise.resolve();

    return patientRepository.updatePatient(payload.id, patient);
  }

  async patientAdmitted(payload) {
    const PatientRepository = require('../../repositories/patientRepository');
    const patientRepository = new PatientRepository();
    const patient = {
      firstname: payload.firstname,
      surname: payload.surname,
      title: payload.title,
      national_code: payload.national_code,
      phone_number: payload.phone_number,
      mobile_number: payload.mobile_number,
    };
    return patientRepository.addPatient(patient, payload.address);
  }

  async patientDocumentUploaded(payload) {
    if (!payload.emr_id || !payload.document_id)
      throw new Error("incomplete data for assigning document to emr (patient)");
    
    const PatientRepository = require('../../repositories/patientRepository');
    retrn (new PatientRepository()).addDocumentToPatientEMR(this.id, payload.document_id, payload.emr_type_id);
  }
}