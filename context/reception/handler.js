const BaseHandler = require('../../utils/base-handler');

module.exports = class ReceptionHandler extends BaseHandler {
  constructor() {
    const queries = {
      'showPatientList': require('./read-side/showPatientList'),
      'showPatientTypes': require('./read-side/showPatientTypes'),
    };

    const commands = {
      'admitPatient': require('./write-side/commands/admitPatient'),
      'updatePatient': require('./write-side/commands/updatePatient'),
      'deletePatient': require('./write-side/commands/removePatient'),
      'uploadPatientDocument': require('./writes-side/commands/uploadPatientDocument'),
    };

    super(queries, commands);
  }
}
