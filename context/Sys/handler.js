const BaseHandler = require('../../utils/base-handler');

module.exports = class SysHandler extends BaseHandler {
  constructor() {
    const queries = {
      checkUserAuth: require('./read-side/checkUserAuth'),
      checkUserAccess: require('./read-side/checkUserAccess'),
      checkUserValidation: require('./read-side/checkUserValidation'),
      getActions: require('./read-side/getActions'),
      getRoles: require('./read-side/getRoles'),
      getRoleAction: require('./read-side/getRoleAction')
    };

    const commands = {
      grantPageAccess: require('./write-side/commands/grantPageAccess'),
      denyPageAccess: require('./write-side/commands/denyPageAccess')
    };

    super(queries, commands);
  }
};
