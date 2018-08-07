const Role = require('../../../infrastructure/db/models/role.model');

class RoleRepository {

  async getAll() {
    return Role.model().findAll({
      raw: true
    });
  }
}

module.exports = RoleRepository;
