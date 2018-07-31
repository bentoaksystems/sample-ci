const BaseHandler = require('../../utils/base-handler');

module.exports = class ReceptionHandler extends BaseHandler {
  constructor() {
    const queries = {
      'showPatient': require('./read-side/'),
    };

    const commands = {
      'deletePatient': require('./write-side/commands/'),
    };

    super(queries, commands);
  }
}
