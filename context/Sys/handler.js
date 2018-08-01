const BaseHandler = require('../../utils/base-handler');

module.exports = class SysHandler extends BaseHandler{
  constructor() {
    const queries = {
      'checkUserAuth': require('./read-side/checkUserAuth'),
      'checkUserAccess': require('./read-side/checkUserAccess'),
      'checkUserValidation': require('./read-side/checkUserValidation'),
      'showSystemTypeDics': require('./read-side/showSystemTypeDics')
    };
  
    const commands = {
      'grantPageAccess': require('./write-side/commands/grantPageAccess'),
      'denyPageAccess': require('./write-side/commands/denyPageAccess'),
      'defineTypeDic': require('./write-side/commands/defineTypeDic')
    };

    super(queries, commands);
  }
}
