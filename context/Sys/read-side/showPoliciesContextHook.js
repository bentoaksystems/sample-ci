const ContextRepository = require('../repositories/contextRepository');

module.exports = async payload => {
  try {
    if (!payload.context_hook_id) throw new Error('context_hook_id is required');
    const repo = new ContextRepository();
    const policies_context_hooks = await repo.loadPolicies(payload.context_hook_id);
    return Promise.resolve(policies_context_hooks);
  } catch (err) {
    throw err;
  }
};
