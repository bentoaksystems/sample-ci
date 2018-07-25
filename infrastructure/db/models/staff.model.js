const Sequelize = require('sequelize');
const Person = require('./person.model');
const Role = require('./role.model');

let Staff;
const init = (seq) => {

  Staff = seq.define('staff', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    }
  }, {
      tableName: 'staff',
      timestamps: false,
      underscored: true
    });
}


module.exports = {
  init,
  model: () => Staff
};
