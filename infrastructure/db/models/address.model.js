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
    },
    city: {
      type: Sequelize.STRING,
    },
    street: {
      type: Sequelize.STRING,
    },
    district: {
      type: Sequelize.INTEGER,
    },
    postal_code: {
      type: Sequelize.BIGINT,
    },
    no: {
      type: Sequelize.INTEGER,
    },
    complete_address: {
      type: Sequelize.STRING,
    }
  }, {
      tableName: 'address',
      timestamps: false,
      underscored: true,
    });
}

module.exports = {
  init,
  model: () => Address,
}
