const contextHookRepository = require('../../repositories/contextHookRepository');
const BaseCommand = require('../../../../utils/base-command');

module.exports = class AddPolicy extends BaseCommand {
  constructor() {
    super();
  }

  async execute(payload, user) {
    try {
      if (!payload.role_ids || (!payload.form_id && !payload.document_type_id && !payload.checklist_id) || !payload.id)
        throw new Error('incomplet data to add policy to specific context-hook');

      if (!payload.role_ids.length)
        throw new Error("There is not role id to set");

      let passedIds = 0;
      if (payload.checklist_id)
        passedIds++;

      if (payload.form_id)
        passedIds++;

      if (payload.document_typd_id)
        passedIds++;

      if (passedIds > 1)
        throw new Error('more than one policy target id were passed');

      const repo = new contextHookRepository();
      const contextHook = await repo.getContextHookeById(payload.id);

      return super.execute(async () => {
        return contextHook.policyAdded(payload);
      });
    } catch (err) {
      throw err;
    }
  }
};
