const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');

class ContextRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  async loadHooks() {
    const contexts = [];
    const returnContextHooks = [];
    await ContextHook.model()
      .findAll({ raw: true })
      .map(element => {
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
}

module.exports = ContextRepository;
