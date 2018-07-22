const Sequelize = require('sequelize');
const Staff = require('./staff.model');

let User;
const init = (seq) => {

  User = seq.define('user', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    username: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      unique: true
    },
    staff_id: {
      type: Sequelize.UUID,
      references: {
        model: 'staff',
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      }
    }
  }, {
      tableName: 'user',
      timestamps: false,
    });

  User.prototype.getName = function () {
    return this.username;
  };

}


module.exports = {
  init,
  model: () => User
};

