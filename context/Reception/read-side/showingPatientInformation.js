const PatientRepository = require('../../Shared-Kernel/repositories/patientRepository');
const errors = require('../../../utils/errors.list');
module.exports = async payload => {
  try {
    if (!payload.person_id) throw new Error('person_id is required');
    // repository
    const patientRepo = new PatientRepository();
    // repository function
    const patient = await patientRepo.getPatientDetial(payload.person_id);
    // check patient really exist :|
    if (!patient) throw new Error('patient not found');
    // return result (promise return because this function is async)
    return Promise.resolve(patient);
  } catch (error) {
    throw error;
  }
};
