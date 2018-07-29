const RoleAction = require('../../../infrastructure/db/models/role_action');
const Role = require('../../../infrastructure/db/models/role.model');
const Action = require('../../../infrastructure/db/models/action.model');
const IRole = require('../write-side/aggregates/role')


/**
 * QUERY RELATED REPOSITORIES:
 */

getRolesActions = async () => {
  return Role.model().findAll({
    include: [{
      model: RoleAction.model(),
    }],
    raw: true
  });
}


/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IRole())
 * e.g: IRole  = require ('../write-side/aggregates/role.js')
 * 
 * **/



module.exports = {
  getRolesActions
}