module.exports = class ContextHook {
  constructor(id, policies) {
    this.id = id;
    this.policies = policies;
  }

  async policyAdded(policy_data) {
    if (this.policies &&
      this.policies.some(el => el.form_id === targetId.form_id && el.document_type_id === targetId.document_type_id && el.checklist_id === targetId.checklist_id))
      throw new Error('There is policy for specified target');

    if (!policy_data.role_ids.length)
      throw new Error("There is not role id to set");

    const contextHookRepository = require('../../repositories/contextHookRepository');
    return new contextHookRepository().addPolicy(this.id, policy_data);
  }

  denyPolicyContexHook(policy_id) {
    const ContextHookRepository = require('../../repositories/contextHookRepository');
    const repo = new ContextHookRepository();
    return repo.denyPolicyContexHook(this.id, policy_id);
  }
}
