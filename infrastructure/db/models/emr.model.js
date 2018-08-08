const Sequelize = require('sequelize');

let EMR;
const init = (seq) => {
  EMR = seq.define('emr', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    entry_date: {
      type: Sequelize.DATE,
      defaultValue: new Date(),
    },
    exit_date: {
      type: Sequelize.DATE,
    },
  }, {
    tableName: 'emr',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => EMR,
};
