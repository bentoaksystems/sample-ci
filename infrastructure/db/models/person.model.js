const Sequelize = require('sequelize');
const db = require('../../index');

let Person;
db.subscribe(sequelize => {

  Person = sequelize.define('person', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    title: {
      type: Sequelize.STRING
    },
    firstname: {
      type: Sequelize.STRING
    },
    surname: {
      type: Sequelize.STRING
    },
    national_code: {
      type: Sequelize.STRING(10),
      unique: true
    }
  });
})


module.exports = () => new Promise((resolve, reject) => {

  function isReady() {
    if (Person)
      resolve({Person});
    else
      setTimeout(isReady, 1000);
  }
  isReady();
});
