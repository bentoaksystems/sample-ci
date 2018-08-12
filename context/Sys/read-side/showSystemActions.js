const ActionRepository = require('../repositories/actionRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {
  try {
    let actions = await new ActionRepository().getAll();
    if (!actions) throw errors.noAction;
    return Promise.resolve(actions);
  } catch (err) {
    throw err;
  }
};
