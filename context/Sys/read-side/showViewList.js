const FormRepository = require('../repositories/formRepository');

module.exports = async () => {
  try {
    const formRepository = new FormRepository();
    return formRepository.getViewList();
  } catch (err) {
    throw err;
  }
};