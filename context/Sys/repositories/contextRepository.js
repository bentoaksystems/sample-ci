const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const Form = require('../../../infrastructure/db/models/form.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const IContextHook = require('../write-side/aggregates/contextHook');
class ContextRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  async getIContextHookeById(id) {
    if (!id) throw new Error('context_hook_id is not defined');
    const contextHook = await ContextHook.model().findOne({
      where: { id }
    });
    if (contextHook) {
      return new IContextHook(contextHook.id);
    } else {
      throw new Error('no context found');
    }
  }

  async loadHooks() {
    const contexts = [];
    const returnContextHooks = [];
    await ContextHook.model()
      .findAll({ raw: true })
      .forEach(element => {
        if (!contexts.includes(element.context)) {
          contexts.push(element.context);
          element.hooks = [element.hook];
          delete element.hook;
          returnContextHooks.push(element);
        } else {
          const findIndex = returnContextHooks.findIndex(el => el.context === element.context);
          returnContextHooks[findIndex]['hooks'].push(element.hook);
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
    const returnParams = await ContextHookPolicy.model().findAll(query);
    return Promise.resolve(returnParams);
  }
  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/

  denyPolicyContexHook(context_hook_id, policy_id) {
    const query = { where: { id: policy_id, context_hook_id } };
    return ContextHookPolicy.model().destroy(query);
  }
}

module.exports = ContextRepository;
