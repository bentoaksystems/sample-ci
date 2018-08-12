const contextHookRepository = require('../../repositories/contextHookRepository');
const BaseCommand = require('../../../../utils/base-command');

module.exports = class CorrectPolicy extends BaseCommand {
  constructor() {
    super();
  }

  async execute(payload, user) {
    try {
      if (!payload.id)
        throw new Error("context_hook_policy'id is not defined");

      if (!payload.context_hook_id)
        throw new Error("context_hook'id is not defined");

      const repo = new contextHookRepository();
      const contextHook = await repo.getContextHookeById(payload.context_hook_id);

      return super.execute(async () => {
        return contextHook.policyCorrected(payload);
      });
    } catch (err) {
      throw err;
    }
  }
}