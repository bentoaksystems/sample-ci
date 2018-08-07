const BaseHandler = require('../../utils/base-handler');

module.exports = class EMRHandler extends BaseHandler {
  constructor() {
    const queries = {
      'showPatientList': require('./read-side/showPatientList'),
      'showPatientTypes': require('./read-side/showPatientTypes'),
    };

    const commands = {
    };

    super(queries, commands);
  }
}
