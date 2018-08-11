class ContextHook {
  constructor(id) {
    this.id = id;
  }

  denyPolicyContexHook(policy_id) {
    const ContextRepository = require('../../repositories/contextRepository');
    const repo = new ContextRepository();
    return repo.denyPolicyContexHook(this.id, policy_id);
  }
}

module.exports = ContextHook;
