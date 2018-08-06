const BaseHandler = require('../../utils/base-handler');

module.exports = class SysHandler extends BaseHandler{
  constructor() {
    const queries = {
      'checkUserAuth': require('./read-side/checkUserAuth'),
      'checkUserAccess': require('./read-side/checkUserAccess'),
      'checkUserValidation': require('./read-side/checkUserValidation'),
      'showSystemTypeDics': require('./read-side/showSystemTypeDics'),
      'showEntityList': require('./read-side/showEntityList'),
      'getFormList': require('./read-side/getFormList'),
      'getOneFormWithFields': require('./read-side/getOneFormWithFields'),
      'showViewList': require('./read-side/showViewList'),
      'runViewQuery': require('./read-side/runViewQuery'),
    };

    const commands = {
      'grantPageAccess': require('./write-side/commands/grantPageAccess'),
      'denyPageAccess': require('./write-side/commands/denyPageAccess'),
      'createForm': require('./write-side/commands/createForm'),
      // 'loadForm': require(''),
      'deleteForm': require('./write-side/commands/deleteForm'),
      'editForm': require('./write-side/commands/editForm'),
      'denyPageAccess': require('./write-side/commands/denyPageAccess'),
      'defineTypeDic': require('./write-side/commands/defineTypeDic')
    };

    super(queries, commands);
  }
}
