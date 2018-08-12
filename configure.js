const Action = require('./infrastructure/db/models/action.model');
const Page = require('./infrastructure/db/models/page.model');
const TypeDictionary = require('./infrastructure/db/models/type_dictionary.model');
const Form = require('./infrastructure/db/models/form.model');
const FormField = require('./infrastructure/db/models/form_field.model');
const ContextHook = require('./infrastructure/db/models/context_hook.model');
const db = require('./infrastructure/db');
const pageList = require('./utils/pages');
const dbHelper = require('./utils/db-helper');
const helpers = require('./utils/helpers');
const fs = require('fs');

let adminUser;

dbHelper.create()
  .then(() => dbHelper.create(true))
  .then(res => {
    return db.isReady();
  })
  .then(result => {
    console.log('-> ', 'database created successfully :)');
    return db.sequelize().transaction(function (t1) {
      // make admin role
      return dbHelper.addAdmin()
        .then(res => {
          adminUser = res.user;
          console.log('-> ', 'admin user created succesffully');
          return Promise.resolve();
        })
        .then(() => {
          const actionList = helpers.getActionList();
          return Promise.all(actionList.map(el => Action.model().findOrCreate({where: {context: el.context, name: el.name}})));
        })
        .then(res => {
          console.log('->  Actions are added successfully');
          return Promise.all(pageList.map(x => Page.model().findOrCreate({where: {name: x.name}, defaults: {url: x.url}})));
        })
        .then(res => {
          console.log('->  Pages are added!');
          // Required Types
          const typeList = [
            {
              name: 'عمومی',
              type: 'patient',
            },
            {
              name: 'دیالیز',
              type: 'patient',
            },
          ];

          return Promise.all(typeList.map(el => TypeDictionary.model().findOrCreate({where: {name: el.name, type: el.type}})));
        })
        .then(async res => {
          console.log('->  Required type are added!');
          const ContextHookList = JSON.parse(fs.readFileSync('context_hook.json', 'utf8'));

          for (let index = 0; index < ContextHookList.length; index++) {
            const existContextHook = (await ContextHook.model().findOne({
              where: {
                context: ContextHookList[index].context_name,
                hook: ContextHookList[index].hook_name,
              },
              include: [
                {
                  model: Form.model(),
                  include: [
                    {
                      model: FormField.model()
                    }
                  ]
                }
              ]
            }));

            let formId = null;

            if (existContextHook && ContextHookList[index].form) {
              if (existContextHook.form.name === ContextHookList[index].form.name) {
                // Delete all form fields for this form and add again
                await FormField.model().destroy({
                  where: {
                    id: {
                      $in: existContextHook.form.form_fields.map(el => el.id)
                    }
                  }
                })

                formId = existContextHook.form.id;
              } else {
                // Should add form and associate to context_hook
                formId = (await Form.model().create({name: ContextHookList[index].form.name, user_id: adminUser.id})).get({plain: true}).id;
                await ContextHook.model().update({form_id: newForm.id}, {where: {id: existContextHook.id}});
              }

              for (let fi = 0; fi < ContextHookList[index].form.fields.length; fi++) {
                await FormField.model().create(Object.assign(ContextHookList[index].form.fields[fi], {form_id: formId}));
              }
            } else {
              // Add form and its field then add context_hook
              if (ContextHookList[index].form) {
                formId = (await Form.model().create({name: ContextHookList[index].form.name, user_id: adminUser.id})).get({plain: true}).id;

                for (let fi = 0; fi < ContextHookList[index].form.fields.length; fi++) {
                  await FormField.model().create(Object.assign(ContextHookList[index].form.fields[fi], {form_id: formId}));
                }
              }

              await ContextHook.model().create({
                context: ContextHookList[index].context_name,
                hook: ContextHookList[index].hook_name,
                form_id: formId,
              });
            }
          }

          return Promise.resolve();
        })
        .then(res => {
          console.log('->  Context-Hooks are added!');
          return Promise.resolve();
        });
    })
      .then(res => {
        process.exit(0);
      })
      .catch(err => {
        console.error('-> ', err);
        process.exit(1);
      });
  })

