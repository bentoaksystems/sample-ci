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

      const repo = new contextHookRepository();
      const contextHook = await repo.getById(payload.id);
      
      return super.execute(async () => {

      });
    } catch (err) {
      throw err;
    }
  }
}