const FormRepository = require('../repositories/formRepository');

module.exports = async(payload, user) => {
  try {
    const formRepository = new FormRepository();
    return formRepository.executeViewQuery(payload);
  } catch (err) {
    throw err;
  }
};