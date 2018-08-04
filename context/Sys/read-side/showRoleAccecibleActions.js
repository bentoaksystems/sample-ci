const RoleRepository = require('../repositories/roleRepository');
const errors = require('../../../utils/errors.list');

module.exports = async payload => {
  try {
    let roleActions = await new RoleRepository().roleAccecibleActionsShown(payload.role_id);
    if (!roleActions) {
      throw new Error('role actions is not defined');
    }
    roleActions = roleActions.get({
      plain: true
    });
    return Promise.resolve(roleActions);
  } catch (err) {
    throw err;
  }
};
