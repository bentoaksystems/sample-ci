const BaseCommand = require('../../../../utils/base-command');
const RoleRepository = require('../../repositories/roleRepository');

class GrantPageAccess extends BaseCommand {

  constructor() {
    super();
  }

  async execute(payload, user) {
    try {

      if (!payload.roleId || (!payload.pageId && !payload.access))
        throw new Error('incomplete payload for grant access to page');

      const repo = new RoleRepository();
      const role = await repo.getIRoleById(payload.roleId);

      return super.execute(async () => {
        return role.pageAccessGranted(payload.pageId, payload.access ? payload.access : null)
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = GrantPageAccess;

