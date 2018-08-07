const BaseHandler = require('../../utils/base-handler');

module.exports = class HRHandler extends BaseHandler {
  constructor() {
    const queries = {
      searchPersonnel: require('./read-side/searchPerson'),
      showOnePerson: require('./read-side/showOnePerson'),
      showRoleList: require('./read-side/showRoleList'),
      showingPatientInformation: require('./read-side/showingPatientInformation')
    };

    const commands = {
      definePersonnel: require('./write-side/commands/definePersonnel'),
      assignUserToPerson: require('./write-side/commands/assignUserToPerson'),
      updatePerson: require('./write-side/commands/updatePerson'),
      updatePersonRoles: require('./write-side/commands/updatePersonRoles'),
      deletePerson: require('./write-side/commands/deletePerson')
    };

    super(queries, commands);
  }
};
