const Role = require('../../../infrastructure/db/models/role.model');


class RoleRepository {
  async load() {
    const roles = await Role.model().findAll();
    const RoleInstances = [];
    const IRole = require('../aggregates/role');
    roles.forEach(x => {
      RoleInstances.push(new IRole(x.name));
    });
    return IRole;
  }


  async  loadUserRoles(user_id) {

    const roles = await Role.model().find({
      where: {user_id}
    })
    const IRole = require('../aggregates/role');
    roles.forEach(x => {
      RoleInstances.push(new IRole(x.name));
    });
    return IRole;
  }

}

module.exports = RoleRepository;