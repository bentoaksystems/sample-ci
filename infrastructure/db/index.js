
const Sequelize = require('sequelize');
const cls = require('continuation-local-storage');
const env = require('../../env');


namespace = cls.createNamespace('HIS-NS');
Sequelize.useCLS(namespace);


isReady = (isTest) => {

  const uri = isTest ? env.db_uri_test : env.db_uri;
  const sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    logging: false
  });

  return sequelize.authenticate()
    .then(() => {
      console.log('-> ', 'Connection has been established successfully :)');
      [
        require('./models/person.model'),
        require('./models/role.model'),
        require('./models/staff.model'),
        require('./models/user.model'),
      ].forEach(model => {
        model.init(sequelize);
      });
      return isTest ? sequelize.sync({force: true}) : sequelize.sync();

    })
    .catch(err => {
      console.error('-> ', 'Unable to connect to the database:', err);
      return Promise.reject(err);
    });

}
module.exports = {
  isReady
};

