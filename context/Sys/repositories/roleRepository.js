const RoleAction = require('../../../infrastructure/db/models/role_action');
const Role = require('../../../infrastructure/db/models/role.model');
const Action = require('../../../infrastructure/db/models/action.model');
const IRole = require('../write-side/aggregates/role')


/**
 * QUERY RELATED REPOSITORIES:
 */

getById = async (id) => {
  return Role.model().find({
    where: {
      id
    },
    include: [{
      model: RoleAction.model(),
      attributes: ['action_id'],
      include: [{
        model: Action.model()
      }],
    }],
  });
}




/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IRole())
 * e.g: IRole  = require ('../write-side/aggregates/role.js')
 * 
 * **/


module.exports = {
  getById
}