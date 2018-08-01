module.exports = class Patient {

  constructor(id) {
    this.id = id;
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
    return patientRepository.addPatient(patient);
  }
}