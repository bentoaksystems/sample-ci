const BaseCommand = require('../../../../utils/base-command');

class DenyActionAccess extends BaseCommand {
  constructor() {
    super();
  }

  async execute(payload) {
    try {
      if (!payload.role_id && !payload.actionIds) throw new Error('action role access id required');

      const roleRepository = require('../../repositories/roleRepository');
      const repo = new roleRepository();
      const role = await repo.getIAction(payload.role_id);
      return super.execute(async () => {
        return role.actionAccessDenied(payload.actionIds, payload.access);
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = DenyActionAccess;
