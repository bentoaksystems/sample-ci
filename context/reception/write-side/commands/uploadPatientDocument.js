const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class uploadPatientDocument extends BaseCommand {
  constructor() {
    super();
  }

  async execute(payload, user) {
    try {
      if (!payload.document_id || !payload.patient_id || !payload.emr_doc_type_id)
        throw new Error("incomplete payload for uploading patient's documents");

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient(payload.patient_id);

      return super.execute(async () => {
        return patient.patientDocumentUploaded(payload);
      });

    } catch(err) {
      throw err;
    }
  }
}