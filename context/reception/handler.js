const BaseHandler = require('../../utils/base-handler');

module.exports = class ReceptionHandler extends BaseHandler {
  constructor() {
    const queries = {
      // 'showPatient': require('./read-side/'),
    };

    const commands = {
      'addPatient': require('./write-side/commands/addPatient'),
      'updatePatient': require('./write-side/commands/updatePatient'),

      'deletePatient': require('./write-side/commands/removePatient'),
    };

    super(queries, commands);
  }
}
