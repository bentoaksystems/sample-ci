const RoleRepository = require('../../Shared-Kernel/repositories/roleRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {
  try {
    const roles = await new RoleRepository().getAll();
    if (!roles) {
      throw errors.noRole;
    }
    return Promise.resolve(roles);
  } catch (err) {
    throw err;
  }
};
