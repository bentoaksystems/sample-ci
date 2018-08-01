const FormRepository = require('../repositories/formRepository');


module.exports = async () => {
  try {
    let formList;

    formList = await new FormRepository().getAllForms();
    console
    return Promise.resolve({
      formList,
    });

  } catch (err) {
    throw err;
  }
}