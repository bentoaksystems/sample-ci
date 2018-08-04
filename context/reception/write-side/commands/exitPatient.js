const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class exitPatient extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id || !payload.exit_type_id)
        throw new Error("incomplete data for exiting patient");

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient();

      return super.execut(async () => {
        return patient.patientExitted(payload.id, payload.exit_type_id);
      });

    } catch (err) {
      throw err;
    }
  }
};