module.exports = class Patient {

  constructor(id, emr, emr_docs, address) {
    this.id = id;
    this.emr = emr;
    this.emrDocs = emr_docs || [];
    this.address = address;
  }

  async patientInfoUpdated(payload) {
    if (!payload.id)
      throw new Error('There is no patient id');

    const PatientRepository = require('../../repositories/patientRepository');
    const patientRepository = new PatientRepository();

    if (payload.address && this.address.id) {
      await patientRepository.updatePatientAddress(this.address.id, payload.address);
    }

    const patient = {};
    [
      'firstname',
      'surname',
      'national_code',
      'phone_number',
      'title',
      'mobile_number',
      'birth_date',
      'age',
    ].forEach(el => {
      if (payload[el])
        patient[el] = payload[el];
    });

    await patientRepository.updatePatientInformation(this.id, patient);

    const emr = {};
    [
      'patient_type_id',
      'regime_type_id',
      'exit_type_id',
      'insurer_id',
    ].forEach(el => {
      if (payload[el])
        emr[el] = payload[el];
    });

    return patientRepository.updatePatientEMR(this.id, emr);
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
      age: payload.age,
      birth_date: payload.birth_date,
    };
    return patientRepository.addPatient(patient, payload.address, payload.patient_type_id);
  }

  async patientDocumentUploaded(payload) {
    if (!payload.emr_doc_type_id || !payload.document_id)
      throw new Error("incomplete data for assigning document to emr (patient)");

    const PatientRepository = require('../../repositories/patientRepository');

    return (new PatientRepository()).addDocumentToPatientEMR(this.emr.id, payload.document_id, payload.emr_doc_type_id)
      .then(res => {
        return Promise.resolve(res ? Object.assign({file_path: payload.file_path}, res) : null);
      });
  }

  async patientRemoved() {
    const IDocument = require('../../../DMS/write-side/aggregate/document');
    const document = new IDocument();
    await document.documentsRemoved(this.emrDocs.map(el => el.document_id));

    const PatientRepository = require('../../repositories/patientRepository');
    const patientRepository = new PatientRepository();

    return patientRepository.removePatient(this.id);
  }

  async patientExitted(id, exit_type_id) {
    if (!id || !exit_type_id)
      throw new Error("incomplete data to exit patient");
    
    const exitData = {
      exit_type_id: exit_type_id,
      exit_date: new Date(),
    };

    const PatientRepository = require('../../repositories/patientRepository');
    return new PatientRepository().updatePatientEMR(id, exitData);
  }
}