const Role = require('../../../infrastructure/db/models/role.model');
class RoleRepository {
  constructor() {}

  async load() {
    const roles = await Role.model().findAll();

    return Promise.resolve(roles);
    // TODO: UNSET THESE LINES!
    // const RoleInstances = [];
    // const IRole = require('../aggregates/role');
    // roles.forEach(x => {
      // RoleInstances.push(new IRole(x.name));
    // });
    // return IRole;
  }

  async loadUserRoles(user_id) {
    const roles = await Role.model().find({
      where: {
        user_id
      }
    });
    const IRole = require('../aggregates/role');
    roles.forEach(x => {
      RoleInstances.push(new IRole(x.name));
    });
    return IRole;
  }

  async getAll() {
    return Role.model().findAll({
      raw: true
    });
  }
}

module.exports = RoleRepository;