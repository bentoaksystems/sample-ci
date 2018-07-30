const Sequelize = require('sequelize');
const Role = require('./role.model');
const Action = require('./action.model');

let RoleAction;
const init = (seq) => {
  RoleAction = seq.define('role_action', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    access: {
      type: Sequelize.STRING,
    }
  }, {
    tableName: 'role_action',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => RoleAction,
};
