const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const db = require('../../../infrastructure/db');

module.exports = class HookPolicyRepository {
  constructor() {

  }

  async getPolicies(context, hook) {
    return ContextHook.model().findOne({
      where: {
        $and: [
          db.sequelize().where(db.sequelize().fn('LOWER', db.sequelize().col('context')), {$iLike: context}),
          db.sequelize().where(db.sequelize().fn('LOWER', db.sequelize().col('hook')), {$iLike: hook})
        ]
      },
      include: [
        {
          model: ContextHookPolicy.model(),
        }
      ]
    });
  }
};
