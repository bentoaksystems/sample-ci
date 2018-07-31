const Action = require('../../../infrastructure/db/models/action.model');
const IAction = require('../write-side/aggregates/action');

class ActionRepository {
  getAll() {
    return Action.model().findAll({
      raw: true
    });
  }
}

module.exports = ActionRepository;
