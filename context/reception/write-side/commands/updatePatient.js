const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class updatePatient extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id || !payload.national_id || !payload.firstname || !payload.surname || !payload.mobile || !payload.phone || !payload.title)
        throw new Error('incomplete payload for adding a update patient');
      const repo = new PatientRepository();
      const person = await repo.findOrCreatePatient(payload.id);

      return super.execut(async () => {
        return person.updatePatientData(payload);
      });

    } catch (err) {
      throw err;
    }
  }
}
