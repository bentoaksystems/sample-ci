const BaseCommand = require('../../../../utils/base-command');
const RoleRepository = require('../../repositories/roleRepository');

class DenyPageAccess extends BaseCommand {

  constructor() {
    super();
  }

  async execute(payload, user) {
    try {

      if (!payload.role_id && !payload.id)
        throw new Error('page role access id required');

      const repo = new RoleRepository();
      const role = await repo.getIRoleById(payload.roleId);

      return super.execute(async () => {
        return role.pageAccessDenied(payload.id)
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = DenyPageAccess;

