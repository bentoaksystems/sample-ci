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
const Form = require('./models/form.model');
const FormField = require('./models/form_field.model');
const ContextHook = require('./models/context_hook.model');
const ContextHookPolicy = require('./models/context_hook_policy.model');
const Checklist = require('./models/checklist.model');
const EMRForm = require('./models/emr_form.model');

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
  ContextHook,
  ContextHookPolicy,
  Checklist,
  EMRForm
];

isReady = (isTest = false) => {
  console.log('-> ', `postgres://${env.db_username}:${env.db_password}@${env.db_host}:${env.db_port}/${!isTest ? env.database : env.database_test}`);
  sequelize = new Sequelize(`postgres://${env.db_username}:${env.db_password}@${env.db_host}:${env.db_port}/${!isTest ? env.database : env.database_test}`, {
    dialect: 'postgres',
    logging: false
  });

  let connect = () =>
    sequelize
      .authenticate()
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
        Person.model().hasOne(User.model(), { onDelete: 'cascade' });
        Person.model().hasOne(EMR.model(), { onDelete: 'cascade' });
        EMR.model().belongsTo(Person.model());
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'patient_type_id', sourceKey: 'id', as: 'patientType' });
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'regime_type_id', sourceKey: 'id' });
        EMR.model().belongsTo(TypeDictionary.model(), { foreignKey: 'exit_type_id', sourceKey: 'id', as: 'exitType' });
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
        ContextHook.model().belongsTo(Form.model());
        Form.model().hasOne(ContextHook.model());
        ContextHookPolicy.model().belongsTo(ContextHook.model());
        ContextHook.model().hasMany(ContextHookPolicy.model());
        ContextHookPolicy.model().belongsTo(Form.model(), { foreignKey: 'form_id', sourceKey: 'id' });
        Form.model().hasMany(ContextHookPolicy.model(), { foreignKey: 'form_id', sourceKey: 'id' });
        ContextHookPolicy.model().belongsTo(TypeDictionary.model(), { foreignKey: 'document_type_id', sourceKey: 'id' });
        TypeDictionary.model().hasMany(ContextHookPolicy.model(), { foreignKey: 'document_type_id', sourceKey: 'id' });
        ContextHookPolicy.model().belongsTo(Checklist.model(), { foreignKey: 'checklist_id', sourceKey: 'id' });
        Checklist.model().hasMany(ContextHookPolicy.model(), { foreignKey: 'checklist_id', sourceKey: 'id' });
        EMRForm.model().belongsTo(EMR.model(), {foreignKey: 'emr_id', sourceKey: 'id'});
        EMR.model().hasMany(EMRForm.model(), {foreignKey: 'emr_id', sourceKey: 'id'});
        EMRForm.model().belongsTo(Checklist.model(), {foreignKey: 'checklist_id', sourceKey: 'id'});
        Checklist.model().hasMany(EMRForm.model(), {foreignKey: 'checklist_id', sourceKey: 'id'});
        EMRForm.model().belongsTo(Form.model(), {foreignKey: 'form_id', sourceKey: 'id'});
        Form.model().hasMany(EMRForm.model(), {foreignKey: 'form_id', sourceKey: 'id'});
        EMRForm.model().belongsTo(TypeDictionary.model(), {foreignKey: 'type_id', sourceKey: 'id'});
        TypeDictionary.model().hasMany(EMRForm.model(), {foreignKey: 'type_id', sourceKey: 'id'});
        EMRForm.model().belongsTo(User.model(), {foreignKey: 'filler_user_id', sourceKey: 'id'});
        User.model().hasMany(EMRForm.model(), {foreignKey: 'filler_user_id', sourceKey: 'id'});

        return isTest ? sequelize.sync({ force: true }) : sequelize.sync();
        // return sequelize.sync({force: true});
      })
      .then(async () => {
        // Set constraints on tables manually
        const queries = [
          'ALTER TABLE context_hook_policy DROP CONSTRAINT IF EXISTS unique_ids',
          'ALTER TABLE context_hook_policy DROP CONSTRAINT IF EXISTS only_one_type',
          'ALTER TABLE context_hook_policy ADD CONSTRAINT unique_ids UNIQUE (form_id, checklist_id, document_type_id, context_hook_id);',
          'ALTER TABLE context_hook_policy ADD CONSTRAINT only_one_type CHECK (' +
            '(form_id is not null and checklist_id is null and document_type_id is null) or' +
            '(form_id is null and checklist_id is not null and document_type_id is null) or' +
            '(form_id is null and checklist_id is null and document_type_id is not null)' +
            ')'
        ];

        for (let index = 0; index < queries.length; index++) await sequelize.query(queries[index]);

        return Promise.resolve();
      })
      .catch(err => {
        console.error('-> ', 'Unable to connect to the database:', err);
        setTimeout(connect, 1000);
      });

  return connect();
};

module.exports = {
  isReady,
  sequelize: () => sequelize,
  tableList,
  Op
};
