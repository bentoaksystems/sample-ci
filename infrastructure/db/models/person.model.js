const Sequelize = require('sequelize');

let Person;
const init = (seq) => {

  Person = seq.define('person', {
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
    },
    mobile_number: {
      type: Sequelize.STRING(12),
    },
    phone_number: {
      type: Sequelize.STRING,
    },
    birth_date: {
      type: Sequelize.DATE,
    },
    age: {
      type: Sequelize.INTEGER,
    },
  }, {
    tableName: 'person',
    timestamps: false,
    underscored: true
  });
}

module.exports = {
  init,
  model: () => Person
};
