const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class upddateDocument extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.emr_id || !payload.document_id || !payload.patient_id)
        throw new Error("incomplete payload for uploading patient's documents");

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient(payload.patient_id);

      return super.execut(async () => {
        return patient.patientDocumentUploaded(payload);
      });

    } catch(err) {
      throw err;
    }
  }
}