const BaseHandler = require('../../utils/base-handler');

module.exports = class ReceptionHandler extends BaseHandler {
  constructor() {
    const queries = {
      'showPatientList': require('./read-side/showPatientList'),
      'showPatientTypes': require('./read-side/showPatientTypes'),
    };

    const commands = {
      'admitPatient': require('./write-side/commands/admitPatient'),
      'updatePatientInfo': require('./write-side/commands/updatePatientInfo'),
      'removePatient': require('./write-side/commands/removePatient'),
      'uploadPatientDocument': require('./write-side/commands/uploadPatientDocument'),
      'exitPatient': require('./write-side/commands/exitPatient'),
    };

    super(queries, commands);
  }
}
