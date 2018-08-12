const BaseCommand = require('../../../../utils/base-command');
const PatientRepository = require('../../repositories/patientRepository');

module.exports = class admitPatient extends BaseCommand {

  constructor() {
    super();
  }

  async execute(payload, user) {
    try {
      const isSemiComplete = [
        'firstname',
        'surname',
        'title',
        'national_code',
        'mobile_number',
        'phone_number',
        'patient_type_id',
        'address'
      ].every(el => payload[el]);

      if (!isSemiComplete || (!payload.birth_date && !payload.age))
        throw new Error('incomplete payload for adding a new patient');

      const repo = new PatientRepository();
      const patient = await repo.findOrCreatePatient();

      return super.execute(async () => {
        return patient.patientAdmitted(payload);
      });

    } catch (err) {
      throw err;
    }
  }
};