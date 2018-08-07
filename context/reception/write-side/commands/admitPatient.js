const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class admitPatient extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      ['firstname', 'surname', 'title', 'national_code', 'mobile_number', 'phone_number', 'patient_type_id', 'address'].forEach(el => {
        if (!payload[el])
          throw new Error('incomplete payload for adding a new patient');
      });

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient();

      return super.execut(async () => {
        return patient.patientAdmitted(payload);
      });

    } catch (err) {
      throw err;
    }
  }
};