const PatientRepository = require('../repositories/patientRepository');

module.exports = async () => {
  try {
    let patients = await new PatientRepository().getPatients();
    return Promise.resolve(patients);
  } catch (err) {
    throw err
  }
}