const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const Form = require('../../../infrastructure/db/models/form.model');
const Role = require('../../../infrastructure/db/models/role.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const IContextHook = require('../write-side/aggregates/contextHook');

class contextHookRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  async loadHooks() {
    const contexts = [];
    const returnContextHooks = [];
    const context_hooks = await ContextHook.model().findAll({ raw: true });
    context_hooks.forEach((element, index) => {
      if (!contexts.includes(element.context)) {
        contexts.push(element.context);
        element.hooks = [{ id: element.id, hook_name: element.hook }];
        delete element.hook;
        returnContextHooks.push(element);
      } else {
        const findIndex = returnContextHooks.findIndex(el => el.context === element.context);
        returnContextHooks[findIndex]['hooks'].push({ id: element.id, hook_name: element.hook });
      }
    });
    return Promise.resolve(returnContextHooks);
  }

  async loadPolicies(context_hook_id) {
    const query = {
      where: { context_hook_id },
      include: [{ model: ContextHook.model(), required: true }, { model: Form.model() }, { model: TypeDictionary.model() }],
      raw: true
    };
    const returnParams = await ContextHookPolicy.model()
      .findAll(query)
      .then(async data => {
        for (let index = 0; index < data.length; index++) {
          data[index]['role_ids'] = await Role.model().findAll({ where: { id: { $in: data[index]['role_ids'] } } });
        }
        return Promise.resolve(data);
      });

    return Promise.resolve(returnParams);
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/

  async getContextHookeById(id) {
    if (!id) throw new Error('context_hook_id is not defined');
    const contextHook = await ContextHook.model().findOne({
      where: { id },
      include: [
        {
          model: ContextHookPolicy.model()
        }
      ]
    });

    if (contextHook) {
      return new IContextHook(contextHook.id, contextHook.context_hook_policies);
    } else {
      throw new Error('no context found');
    }
  }

  async addPolicy(id, data) {
    return ContextHookPolicy.model().create({
      context_hook_id: id,
      is_required: data.is_required,
      role_ids: data.role_ids,
      policy_json: data.policy_json,
      form_id: data.form_id,
      document_type_id: data.document_type_id,
      checklist_id: data.checklist_id
    });
  }

  async denyPolicyContexHook(context_hook_id, policy_id) {
    const query = { where: { id: policy_id, context_hook_id } };
    return ContextHookPolicy.model().destroy(query);
  }

  async correctPolicy(id, data) {
    return ContextHookPolicy.model().update(data, { where: { id } });
  }
}

module.exports = contextHookRepository;
