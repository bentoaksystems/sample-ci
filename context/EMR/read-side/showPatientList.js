const PatientRepository = require('../../Shared-Kernel/repositories/patientRepository');

module.exports = async (payload, user) => {
  try {
    const search_data = {};
    ['name', 'phone_number', 'mobile_number', 'national_code', 'patient_type_id'].forEach(el => {
      if (payload[el] && payload[el].trim())
        search_data[el] = payload[el];
    });

    if (payload.is_exited !== null && payload.is_exited !== undefined)
      search_data.is_exited = payload.is_exited;

    let patients = await new PatientRepository().getPatients(search_data, payload.offset || 0, payload.limit || 10);
    return Promise.resolve(patients);
  } catch (err) {
    throw err
  }
}