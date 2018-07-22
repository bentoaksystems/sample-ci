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
    },
    person_id: {
      type: Sequelize.UUID,
      references: {
        model: 'person',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      }
    },
    role_id: {
      type: Sequelize.UUID,
      references: {
        model: 'role',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      }
    }
  },{
    tableName: 'staff',
    timestamps: false,
  });
}


module.exports = {
  init,
  model: () => Staff
};
