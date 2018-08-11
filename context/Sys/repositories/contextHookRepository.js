const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const IContextHook = require('../write-side/aggregates/contextHook');

class contextHookRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  async loadHooks() {
    const contexts = [];
    const returnContextHooks = [];
    await ContextHook.model()
      .findAll({raw: true})
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

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/

  async getByContextHookNames(context, hook) {
    const ch = await ContextHook.model().findOne({
      where: {
        $and: [
          db.sequelize().where(db.sequelize().fn('LOWER', db.sequelize().col('context')), {$iLike: context}),
          db.sequelize().where(db.sequelize().fn('LOWER', db.sequelize().col('hook')), {$iLike: hook})
        ]
      },
      includes: [
        {
          model: ContextHookPolicy.model(),
        }
      ]
    });

    if (!ch)
      throw new Error('There is no context-hook with these context and hook names');

    console.log('ch ==> ', ch);

    return new IContextHook(ch.id, ch.context_hook_policys);
  }

  async addPolicy(id, data) {
    return ContextHookPolicy.model().create({
      context_hook_id: id,
      is_required: data.is_required,
      role_ids: data.role_ids,
      policy_json: data.policy_json,
      form_id: data.form_id,
      document_type_id: data.document_type_id,
      checklist_id: data.checklist_id,
    });
  }
}

module.exports = contextHookRepository;
