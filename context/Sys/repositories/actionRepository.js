const Action = require('../../../infrastructure/db/models/action.model');
const IAction = require('../write-side/aggregates/action');


/**
 * QUERY RELATED REPOSITORIES:
 */

getAll = async () => {
    return Action.model().findAll({
        raw: true
    });
}

/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPage())
 * e.g: IPage  = require ('../write-side/aggregates/page.js')
 * 
 * **/



module.exports = {
    getAll
}