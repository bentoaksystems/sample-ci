
const Sequelize = require('sequelize');
const env = require('../../env');
const Rx = require('rx');


const sequelize = new Sequelize(env.db_uri, {
  dialect: 'postgres'
});
const sequelize_test = new Sequelize(env.db_uri_test, {
  dialect: 'postgres'
});

const db = Rx.Observable.create(observer => {

  sequelize.authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      observer.onNext(sequelize);
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

  // Any cleanup logic might go here
  return () => console.log('disposed')
});

module.exports = db;

