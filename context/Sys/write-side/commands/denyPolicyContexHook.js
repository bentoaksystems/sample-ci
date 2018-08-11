const BaseCommand = require('../../../../utils/base-command');
const ContextHookRepository = require('../../repositories/contextHookRepository');

class DenyPolicyContexHook extends BaseCommand {
  constructor() {
    super();
  }

  async execute(payload) {
    try {
      if (!payload.context_hook_id || !payload.context_hook_policy_id) {
        throw new Error('context_hook_id && context_hook_policy_id is required');
      }

      const repo = new ContextHookRepository();
      const contextHook = await repo.getContextHookeById(payload.context_hook_id);

      return super.execute(async () => {
        return contextHook.denyPolicyContexHook(payload.context_hook_policy_id);
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = DenyPolicyContexHook;
