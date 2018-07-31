const Sequelize = require('sequelize');

let EMRDoc;
const init = (seq) => {
  EMRDoc = seq.define('emrdoc', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  }, {
    tableName: 'emrdoc',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => EMRDoc,
};
