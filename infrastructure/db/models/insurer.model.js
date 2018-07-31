const Sequelize = require('sequelize');

let Insurer;
const init = (seq) => {
  Insurer = seq.define('insurer', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    }
  }, {
    tableName: 'insurer',
    timestamps: false,
    underscored: true
  });
}

module.exports = {
  init,
  model: () => Insurer,
};
