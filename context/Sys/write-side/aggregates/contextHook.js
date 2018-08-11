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

  async policyCorrected(policy_data) {
    if (!policy_data.id)
      throw new Error("context_hook_policy'id is not defined");

    const needCorrection = {};

    let passedIds = 0;
    ['checklist_id', 'form_id', 'document_type_id'].forEach(el => {
      if (policy_data[el]) {
        needCorrection.checklist_id = null;
        needCorrection.form_id = null;
        needCorrection.document_type_id = null;

        needCorrection[el] = policy_data[el];

        passedIds++;
      }
    });

    if (passedIds > 1)
      throw new Error('more than one policy target id were passed');

    ['is_required', 'policy_json', 'role_ids'].forEach(el => {
      if (policy_data[el] !== undefined && policy_data[el] !== null)
        needCorrection[el] = policy_data[el];
    });

    if (Object.assign(needCorrection).length)
      return Promise.resolve();

    const contextHookRepository = require('../../repositories/contextHookRepository');
    return new contextHookRepository().correctPolicy(policy_data.id, needCorrection);
  }

  denyPolicyContexHook(policy_id) {
    const ContextHookRepository = require('../../repositories/contextHookRepository');
    const repo = new ContextHookRepository();
    return repo.denyPolicyContexHook(this.id, policy_id);
  }
}
