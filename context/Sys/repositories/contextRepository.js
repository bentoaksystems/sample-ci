const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');

class ContextRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  loadHooks() {
    return ContextHook.model().findAll();
  }
  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/
}

module.exports = ContextRepository;
