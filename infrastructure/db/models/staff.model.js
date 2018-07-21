const Sequelize = require('sequelize');
const db = require('../../index');
const Person = require('./person.model');
const Role = require('./role.model');

let Staff;
db.subscribe(sequelize => {


  Promise.all(Person.isReady(), Role.isReady())
    .then(res => {

      Staff = sequelize.define('staff', {
        id: {
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        person_id: {
          type: Sequelize.UUID,
          references: {
            model: res.find(x => x.Person).Person,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          }
        },
        role_id: {
          type: Sequelize.UUID,
          references: {
            model: res.find(x => x.Role).Role,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          }
        }
      });

    });

})


module.exports = () => new Promise((resolve, reject) => {

  function isReady() {
    if (Staff)
      resolve({Staff});
    else
      setTimeout(isReady, 1000);
  }
  isReady();
});
