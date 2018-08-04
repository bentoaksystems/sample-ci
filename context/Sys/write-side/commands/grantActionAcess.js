const BaseCommand = require('../../../../utils/base-command');
const RoleRepository = require('../../repositories/roleRepository');

class GrantActionAcess extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload) {
    try {
      if (!payload.role_id && !payload.access) throw new Error('role_id and access is required');

      const repo = new RoleRepository();
      const role = await repo.getIAction(payload.role_id);

      return super.execut(async () => {
        return role.actionAssigned(payload.actionIds, payload.access);
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = GrantActionAcess;
