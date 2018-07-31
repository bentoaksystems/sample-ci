const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class GrantPageAccess extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {

      if (!payload.data)
        throw new Error('incomplete payload for adding a new patient');
      const repo = new PersonRepository();
      const person = await repo.getIRoleById(payload.roleId);

      return super.execut(async () => {
        return role.pageAccessGranted(payload.pageId, payload.access ? payload.access : null)
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = GrantPageAccess;


