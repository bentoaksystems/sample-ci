const BaseHandler = require('../../utils/base-handler');

module.exports = class DMSHandler extends BaseHandler{
  constructor() {
    const queries = {
    };
  
    const commands = {
      'uploadDocument': require('./write-side/commands/uploadDocument'),
      'updateDocument': require('./write-side/commands/updateDocument'),
      'removeDocument': require('./write-side/commands/removeDocument'),
    };

    super(queries, commands);
  }
}