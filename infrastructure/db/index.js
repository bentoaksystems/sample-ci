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
const EMR = require('./models/emr.model');
const Document = require('./models/document.model');
const EMRDoc = require('./models/emrdoc.model');
const TypeDictionary = require('./models/type_dictionary.model');
const Insurer = require('./models/insurer.model');

// namespace = cls.createNamespace('HIS-NS');
// Sequelize.useCLS(namespace);

Sequelize.useCLS(require('cls-hooked').createNamespace('HIS-NS'));


let sequelize;
isReady = (isTest = false) => {
  console.log('-> ', `postgres://${env.db_username}:${env.db_password}@${env.db_host}:${env.db_port}/${isTest ? env.database : env.database_test}`);
  sequelize = new Sequelize(`postgres://${env.db_username}:${env.db_password}@${env.db_host}:${env.db_port}/${isTest ? env.database : env.database_test}`, {
    dialect: 'postgres',
    logging: false
  });

  let connect = () => {
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
          EMR,
          Document,
          EMRDoc,
          TypeDictionary,
          Insurer,
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
        User.model().belongsTo(Person.model());
        Person.model().hasOne(User.model());
        EMR.model().belongsTo(Person.model());
        EMR.model().belongsTo(TypeDictionary.model(), {as: 'patient_type_id'});
        EMR.model().belongsTo(TypeDictionary.model(), {as: 'regime_type_id'});
        EMR.model().belongsTo(TypeDictionary.model(), {as: 'exit_type_id'});
        TypeDictionary.model().hasMany(EMR.model(), {as: 'patient_type_id'});
        TypeDictionary.model().hasMany(EMR.model(), {as: 'regime_type_id'});
        TypeDictionary.model().hasMany(EMR.model(), {as: 'exit_type_id'});
        EMR.model().belongsTo(Insurer.model());
        Insurer.model().hasMany(EMR.model());
        Document.model().belongsTo(User.model());
        Document.model().belongsTo(TypeDictionary.model());
        TypeDictionary.model().hasMany(Document.model());
        EMRDoc.model().belongsTo(Document.model());
        Document.model().hasMany(EMRDoc.model());
        EMRDoc.model().belongsTo(TypeDictionary.model());
        TypeDictionary.model().hasMany(EMRDoc.model());
        EMRDoc.model().belongsTo(EMR.model());
        EMR.model().hasMany(EMRDoc.model());

        return isTest ? sequelize.sync({force: true}) : sequelize.sync();
        // return sequelize.sync({force: true});

      })
      .catch(err => {
        console.error('-> Unable to connect to the database:', err);
        setTimeout(connect, 5000);
      });
  }
  connect();
}


module.exports = {
  isReady,
  sequelize: () => sequelize
};

