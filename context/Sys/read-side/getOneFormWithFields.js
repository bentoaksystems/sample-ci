const FormRepository = require('../repositories/formRepository');


module.exports = async (payload) => {
  try {
    let formInfo;

    formInfo = await new FormRepository().getOneForm(payload);

    return Promise.resolve({
      formInfo,
    });

  } catch (err) {
    throw err;
  }
}