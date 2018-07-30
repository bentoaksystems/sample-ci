
const Sequelize = require('sequelize');
// const cls = require('continuation-local-storage');
const env = require('../../env');

const Page = require('./models/page.model');
const Role = require('./models/role.model');
const Action = require('./models/action.model');
const RoleAction = require('./models/role_action');
const Person = require('./models/person.model');
const PageRole = require('./models/page_role.model');
const Staff = require('./models/staff.model');
const User = require('./models/user.model');

// namespace = cls.createNamespace('HIS-NS');
// Sequelize.useCLS(namespace);

Sequelize.useCLS(require('cls-hooked').createNamespace('HIS-NS'));


let sequelize;
isReady = (isTest = false) => {
  const uri = isTest ? env.db_uri_test : env.db_uri;
  sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    logging: false
  });

  return sequelize.authenticate()
    .then(() => {
      console.log('-> ', 'Connection to db has been established successfully :)');
      [
        Page,
        Role,
        Action,
        RoleAction,
        Person,
        PageRole,
        Staff,
        User,
      ].forEach(model => {
        model.init(sequelize);
      });

      /**
       * Please define relations between tables (models) here
       * (Not define in its model)
       */
      Page.model().hasMany(PageRole.model());
      Role.model().hasMany(RoleAction.model());
      Role.model().hasMany(PageRole.model());
      Role.model().hasMany(Staff.model());
      Action.model().hasMany(RoleAction.model());
      RoleAction.model().belongsTo(Action.model());
      RoleAction.model().belongsTo(Role.model());
      Person.model().hasMany(Staff.model());
      PageRole.model().belongsTo(Page.model());
      PageRole.model().belongsTo(Role.model());
      Staff.model().belongsTo(Person.model());
      Staff.model().belongsTo(Role.model());
      Staff.model().hasMany(User.model());
      User.model().belongsTo(Staff.model());


      // return isTest ? sequelize.sync({force: true}) : sequelize.sync();
      return sequelize.sync({force: true});

    })
    .catch(err => {
      console.error('-> ', 'Unable to connect to the database:', err);
      return Promise.reject(err);
    });

}


module.exports = {
  isReady,
  sequelize: () => sequelize
};

