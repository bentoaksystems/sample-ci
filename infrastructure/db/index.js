const Sequelize = require('sequelize');
// const cls = require('continuation-local-storage');
const env = require('../../env');

const Page = require('./models/page.model');
const Role = require('./models/role.model');
const Action = require('./models/action.model');
const RoleAction = require('./models/role_action');
const Person = require('./models/person.model');
const Address = require('./models/address.model');
const PageRole = require('./models/page_role.model');
const Staff = require('./models/staff.model');
const User = require('./models/user.model');
const EMR = require('./models/emr.model');
const Document = require('./models/document.model');
const EMRDoc = require('./models/emrdoc.model');
const TypeDictionary = require('./models/type_dictionary.model');
const Insurer = require('./models/insurer.model');
const Address = require('./models/address.model');
const Form = require('./models/form.model');
const FormField = require('./models/form_field.model');

// namespace = cls.createNamespace('HIS-NS');
// Sequelize.useCLS(namespace);

Sequelize.useCLS(require('cls-hooked').createNamespace('HIS-NS'));

const Op = Sequelize.Op;


let sequelize;
let tableList = [
  Address,
  Page,
  Role,
  Action,
  RoleAction,
  Person,
  PageRole,
  Staff,
  User,
  FormField,
  Form,
  EMR,
  Document,
  EMRDoc,
  TypeDictionary,
  Insurer,
];

isReady = (isTest = false) => {
  const uri = isTest ? env.db_uri_test : env.db_uri;
  sequelize = new Sequelize(uri, {
    dialect: 'postgres',
    logging: false
  });

  return sequelize.authenticate()
    .then(() => {
      console.log('-> ', 'Connection to db has been established successfully :)');
      tableList.forEach(model => {
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
        Person.model().hasMany(Staff.model(), { onDelete: 'cascade' });
        PageRole.model().belongsTo(Page.model());
        PageRole.model().belongsTo(Role.model());
        Staff.model().belongsTo(Person.model(), { onDelete: 'cascade' });
        Staff.model().belongsTo(Role.model());
        User.model().belongsTo(Person.model());
        Person.model().hasOne(User.model(), {onDelete: 'cascade'});
        Person.model().hasOne(EMR.model(), {onDelete: 'cascade'});
        EMR.model().belongsTo(Person.model());
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'patient_type_id', sourceKey: 'id', as: 'patientType' });
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'regime_type_id', sourceKey: 'id' });
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'exit_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(EMR.model(), { foreignKey: 'patient_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(EMR.model(), { foreignKey: 'regime_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(EMR.model(), { foreignKey: 'exit_type_id', sourceKey: 'id' });
        EMR.model().belongsTo(Insurer.model());
        Insurer.model().hasMany(EMR.model());
        Document.model().belongsTo(User.model());
        Document.model().belongsTo(TypeDictionary.model(), { foreignKey: 'document_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(Document.model(), { foreignKey: 'document_type_id', sourceKey: 'id' });
        EMRDoc.model().belongsTo(Document.model(), { onDelete: 'cascade' });
        Document.model().hasMany(EMRDoc.model());
        EMRDoc.model().belongsTo(TypeDictionary.model(), { foreignKey: 'emr_doc_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(EMRDoc.model(), { foreignKey: 'emr_doc_type_id', sourceKey: 'id' });
        EMRDoc.model().belongsTo(EMR.model(), { onDelete: 'cascade' });
        EMR.model().hasMany(EMRDoc.model());
        Address.model().belongsTo(Person.model(), { onDelete: 'cascade' });
        Person.model().hasMany(Address.model());
        User.model().hasMany(Form.model());
        Form.model().belongsTo(User.model());
        FormField.model().belongsTo(Form.model());
        Form.model().hasMany(FormField.model());

        return isTest ? sequelize.sync({ force: true }) : sequelize.sync();
        // return sequelize.sync({force: true});
      })
      .catch(err => {
        console.error('-> ', 'Unable to connect to the database:', err);
        setTimeout(connect, 1000);
      });
  };
  return connect();
};

module.exports = {
  isReady,
  sequelize: () => sequelize,
  tableList,
  Op,
};
