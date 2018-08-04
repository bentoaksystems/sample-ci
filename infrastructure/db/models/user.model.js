const Sequelize = require('sequelize');

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
    }
  }, {
      tableName: 'user',
      timestamps: false,
      underscored: true
    });
}


module.exports = {
  init,
  model: () => User
};

