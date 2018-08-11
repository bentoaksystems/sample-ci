module.exports = class ContextHook {
  constructor(id, policies) {
    this.id = id;
    this.policies = policies;
  }

  async policyAdded(policy_data) {
    if (this.policies &&
      this.policies.some(el => el.form_id === targetId.form_id && el.document_type_id === targetId.document_type_id && el.checklist_id === targetId.checklist_id))
      throw new Error('There is policy for specified target');

    const contextHookRepository = require('../../repositories/contextHookRepository');
    return new contextHookRepository().addPolicy(this.id, policy_data);
  }

  denyPolicyContexHook(policy_id) {
    const ContextRepository = require('../../repositories/contextRepository');
    const repo = new ContextRepository();
    return repo.denyPolicyContexHook(this.id, policy_id);
  }
}
