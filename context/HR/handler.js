const BaseHandler = require('../../utils/base-handler');

module.exports = class HRHandler extends BaseHandler {
    constructor() {
        const queries = {
            'searchPersonnel': require('./read-side/searchPerson'),
            'showOnePerson': require('./read-side/showOnePerson'),
            'showRoleList': require('./read-side/showRoleList'),
        };

        const commands = {
            'addPerson': require('./write-side/commands/addPerson'),
            'assignRolesToPerson': require('./write-side/commands/assignRolesToPerson'),
            'assignUserToPerson': require('./write-side/commands/assignUserToPerson'),
            'deletePerson': require('./write-side/commands/deletePerson'),
        };

        super(queries, commands);
    }
}
