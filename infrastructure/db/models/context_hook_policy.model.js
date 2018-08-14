const Sequelize = require('sequelize');

let ContextHookPolicy;
const init = (seq) => {
  ContextHookPolicy = seq.define('context_hook_policy', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    role_ids: {
      type: Sequelize.ARRAY(Sequelize.UUID),
      allowNull: false,
    },
    is_required: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    policy_json: {
      type: Sequelize.JSON,
    }
  }, {
    tableName: 'context_hook_policy',
    timestamps: false,
    underscored: true,
  });
};

module.exports = {
  init,
  model: () => ContextHookPolicy,
};
