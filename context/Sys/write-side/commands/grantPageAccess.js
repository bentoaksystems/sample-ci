const BaseCommand = require('../../../../utils/base-command');
const RoleRepository = require('../../repositories/roleRepository');

class GrantPageAccess extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      const repo = new RoleRepository();
      const role = await repo.getIRoleById(payload.roleId);

      await super.execut(role, RoleRepository.Roles, async (editingRole) => {
        return editingRole.pageAccessGranted(payload.pageId, payload.access ? payload.access : null)
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = GrantPageAccess;

