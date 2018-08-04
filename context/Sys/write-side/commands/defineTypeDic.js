const BaseCommand = require('../../../../utils/base-command');
const TypeDic = require('../aggregates/typeDic');

class GrantPageAccess extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {

      if (!payload.type || !payload.name)
        throw new Error('incomplete payload for defenition of type dictionary');

      const typeDic = new TypeDic(null, payload.name, payload.type);

      return super.execut(async () => {
        return typeDic.typeDicDefined();
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = GrantPageAccess;

