const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class RemovePatient extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id)
        throw new Error("Patient's id is no defined");

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient(payload.id);

      return super.execut(async () => {
        return patient.patientRemoved();
      })
    } catch (err) {
      throw err;
    }
  }
}