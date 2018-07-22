
const Sequelize = require('sequelize');
const cls = require('continuation-local-storage');
const env = require('../../env');


namespace = cls.createNamespace('HIS-NS');
Sequelize.useCLS(namespace);

let sequelize;
isReady = (isTest = false) => {
  if (sequelize)
    return Promise.resolve(true);

  const uri = isTest ? env.db_uri_test : env.db_uri;
  sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    logging: false
  });

  return sequelize.authenticate()
    .then(() => {
      console.log('-> ', 'Connection to db has been established successfully :)');
      [
        require('./models/person.model'),
        require('./models/role.model'),
        require('./models/staff.model'),
        require('./models/user.model'),
      ].forEach(model => {
        model.init(sequelize);
      });
      return isTest ? sequelize.sync({force: true}) : sequelize.sync();
      // return sequelize.sync({force: true});

    })
    .catch(err => {
      console.error('-> ', 'Unable to connect to the database:', err);
      return Promise.reject(err);
    });

}
module.exports = {
  isReady,
  sequelize: () => sequelize,
};

