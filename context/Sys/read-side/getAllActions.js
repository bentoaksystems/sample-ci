const ActionRepository = require('../repositories/actionRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    let action = await ActionRepository.getAll();
    if (!action)
      throw errors.noAction;
    return Promise.resolve(action);

  } catch (err) {
    throw err;
  }


}