const Action = require('./infrastructure/db/models/action.model');
const Page = require('./infrastructure/db/models/page.model');
const db = require('./infrastructure/db');
const pageList = require('./utils/pages');
const dbHelper = require('./utils/db-helper');
const helpers = require('./utils/helpers');

dbHelper.create()
  .then(() => dbHelper.create(true))
  .then(res => {
    return db.isReady();
  })
  .then(result => {
    console.log('--------------> ', result );
    return db.sequelize().transaction(function (t1) {
      // make admin role
      return dbHelper.addAdmin()
        .then(res => {
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
          return Promise.resolve();
        })
    })
      .then(res => {
        process.exit(0);
      })
      .catch(err => {
        console.error('-> ', err);
        process.exit(1);
      });
  }).catch(err => {
    console.error('-> ', err);
    process.exit(1);
  })

