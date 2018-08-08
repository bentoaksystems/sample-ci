const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class updatePatientInfo extends BaseCommand {

  constructor() {
    super();
  }

  async execute(payload, user) {
    try {
      if (!payload.id)
        throw new Error("Patient's id is not defined");

      if (Object.keys(payload).length === 1)
        return Promise.resolve();

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient(payload.id);

      return super.execute(async () => {
        delete payload.entry_date;
        return patient.patientInfoUpdated(payload);
      });

    } catch (err) {
      throw err;
    }
  }
}
