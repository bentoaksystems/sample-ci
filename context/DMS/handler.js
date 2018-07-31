const BaseHandler = require('../../utils/base-handler');

module.exports = class DMSHandler extends BaseHandler{
  constructor() {
    const queries = {
    };
  
    const commands = {
      'uploadDocument': require('./write-side/commands/documentUploaded'),
    };

    super(queries, commands);
  }
}