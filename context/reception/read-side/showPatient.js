const PersonRepository = require('../repositories/personRepository');

module.exports = async () => {

  try {
    let patients = await new PersonRepository().getPatients();
    return Promise.resolve(patients);
  } catch (err) {
    throw err
  }
}