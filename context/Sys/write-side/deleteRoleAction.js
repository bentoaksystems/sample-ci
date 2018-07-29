const RoleRepository = require('../repositories/roleRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    let roleActions = await RoleRepository.deleteAction(payload.actionIds);
    if (!roleActions) {
      throw new Error('could not delete action by role id');
    }
    return Promise.resolve({
      result: true
    });

  } catch (err) {
    throw err;
  }


}