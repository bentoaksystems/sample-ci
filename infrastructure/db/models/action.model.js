const Sequelize = require('sequelize');

let Action;
const init = (seq) => {
  Action = seq.define('action', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    context: {
      type: Sequelize.STRING,
      unique: 'compositIndex',
    },
    name: {
      type: Sequelize.STRING,
      unique: 'compositIndex',
    }
  }, {
    tableName: 'action',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => Action,
};
