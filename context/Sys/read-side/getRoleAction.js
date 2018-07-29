const RoleRepository = require('../repositories/roleRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    let roleActions = await RoleRepository.getById(payload.id);
    roleActions = roleActions.get({
      plain: true
    });
    return Promise.resolve(roleActions);

  } catch (err) {
    throw err;
  }


}