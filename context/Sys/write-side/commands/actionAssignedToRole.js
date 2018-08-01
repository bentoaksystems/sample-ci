const BaseCommand = require('../../../../utils/base-command');
const RoleRepository = require('../../repositories/roleRepository');

class ActionAssignedToRole extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload) {
    try {
      if (!payload.roleId && !payload.access) throw new Error('role_id and access is required');

      const repo = new RoleRepository();
      const role = await repo.getIRoleById(payload.roleId);

      return super.execut(async () => {
        return role.actionAssignedToRole(payload.actionIds, payload.access);
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ActionAssignedToRole;
