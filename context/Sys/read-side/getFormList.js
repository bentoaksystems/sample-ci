const FormRepository = require('../repositories/formRepository');


module.exports = async () => {
  try {
    let formList;

    formList = await FormRepository.getAllForms();
    return Promise.resolve({
      formList,
    });

  } catch (err) {
    throw err;
  }
}