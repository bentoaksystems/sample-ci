const Sequelize = require('sequelize');

let ContextHook;
const init = (seq) => {
  ContextHook = seq.define('context_hook', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    context: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'hc_constraint',
    },
    hook: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'hc_constraint',
    },
  }, {
    tableName: 'context_hook',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => ContextHook,
};
