const Sequelize = require('sequelize');
const db = require('../../index');

let User;
db.subscribe(sequelize => {

  User = sequelize.define('user', {
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
  });
})


module.exports = () => new Promise((resolve, reject) => {

  function isReady() {
    if (User)
      resolve({User});
    else
      setTimeout(isReady, 1000);
  }
  isReady();
});
