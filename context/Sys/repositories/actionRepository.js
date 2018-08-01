const Action = require('../../../infrastructure/db/models/action.model');

class ActionRepository {
  /*
   * QUERY RELATED REPOSITORIES:
   */

  getAll() {
    return Action.model().findAll({
      raw: true
    });
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
   * e.g: IAction  = require ('../write-side/aggregates/action.js')
   *
   * **/
}

module.exports = ActionRepository;
