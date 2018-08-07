const Sequelize = require('sequelize');

let Address;
const init = (seq) => {
  Address = seq.define('address', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    province: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    district: {
      type: Sequelize.STRING,
    },
    street: {
      type: Sequelize.STRING,
    },
    unit: {
      type: Sequelize.STRING
    },
    no: {
      type: Sequelize.STRING,
    },
    postal_code: {
      type: Sequelize.STRING,
    },
  }, {
    tableName: 'address',
    timestamps: false,
    underscored: true,
  });
}

module.exports = {
  init,
  model: () => Address,
};
