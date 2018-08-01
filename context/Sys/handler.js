const BaseHandler = require('../../utils/base-handler');

module.exports = class SysHandler extends BaseHandler {
  constructor() {
    const queries = {
      checkUserAuth: require('./read-side/checkUserAuth'),
      checkUserAccess: require('./read-side/checkUserAccess'),
      checkUserValidation: require('./read-side/checkUserValidation'),
      showSystemActions: require('./read-side/showSystemActions'),
      showSystemRoles: require('./read-side/showSystemRoles'),
      showRoleAccecibleActions: require('./read-side/showRoleAccecibleActions')
    };

    const commands = {
      grantPageAccess: require('./write-side/commands/grantPageAccess'),
      denyPageAccess: require('./write-side/commands/denyPageAccess'),
      grantActionAcess: require('./write-side/commands/grantActionAcess'),
      denyActionAcess: require('./write-side/commands/denyActionAcess')
    };

    super(queries, commands);
  }
};
