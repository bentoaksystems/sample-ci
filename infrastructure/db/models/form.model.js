const Sequelize = require('sequelize');

let Form;

const init = (seq) => {

  Form = seq.define('form', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    context: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'form',
    timestamps: false,
    underscored: true,
  })
}

module.exports = {
  init,
  model: () => Form,
}