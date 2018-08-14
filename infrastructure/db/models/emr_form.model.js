const Sequelize = require('sequelize');

let EMRForm;
const init = (seq) => {
  EMRForm = seq.define('emr_form', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    filled_at: {
      type: Sequelize.DATE,
      defaultValue: new Date(),
    },
    data_json: {
      type: Sequelize.JSON,
    }
  }, {
    tableName: 'emr_form',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => EMRForm,
};
