const Sequelize = require('sequelize');
const db = require('../../index');

let Role;
db.subscribe(sequelize => {

  Role = sequelize.define('person', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
      unique: true 
    }
  });
})


module.exports = () => new Promise((resolve, reject) => {

  function isReady() {
    if (Role)
      resolve({Role});
    else
      setTimeout(isReady, 1000);
  }
  isReady();
});
