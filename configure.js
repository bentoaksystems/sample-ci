const dbHelper = require('./utils/db-helper');
const Role = require('./infrastructure/db/models/role.model');
const Staff = require('./infrastructure/db/models/staff.model');
const Person = require('./infrastructure/db/models/person.model');
const Action = require('./infrastructure/db/models/action.model');
const RoleAction = require('./infrastructure/db/models/role_action');
const PageRole = require('./infrastructure/db/models/page_role.model');
const Page = require('./infrastructure/db/models/page.model');
const User = require('./infrastructure/db/models/user.model');
const Page = require('./infrastructure/db/models/page.model');
const bycript = require('./utils/bcrypt');
const db = require('./infrastructure/db');
const Context = require('./context');
const pageList = require('./utils/pages');

let adminRole, adminStaff, adminUser;
dbHelper.create()
  .then(res => {
    return db.isReady();
  })
  .then(result => {
    console.log('-> ', 'database created successfully :)');
    return db.sequelize().transaction(function (t1) {
      // make admin role
      return Role.model().findOrCreate({where: {name: 'Admin'}})
        .spread((role, created) => {
          return Promise.resolve(role);
        })
        .then(res => {

          adminRole = res;
          console.log('-> ', 'admin role created successfully');
          return Staff.model().findOne({
            where: {role_id: adminRole.get({plain: true})}.id,
            include: [{model: Person.model()}]
          })
        })
        .then(res => {

          adminStaff = res;

          if (adminStaff)
            return Promise.resolve();

          return Person.model().create({
            title: '',
            firstname: 'admin',
            surname: 'admin',
            national_code: '-'
          })
            .then(res => {
              return Staff.model().create({
                role_id: adminRole.get({plain: true}).id,
                person_id: res.get({plain: true}).id
              })
            })

        })
        .then(res => {
          console.log('-> ', 'admin person & staff created succesffully');

          if (!adminStaff)
            adminStaff = res;

          return bycript.genSalt('admin@123');

        })
        .then(hash => {

          return User.model().findOrCreate({
            where: {staff_id: adminStaff.get({plain: true}).id},
            defaults: {
              username: 'admin',
              password: hash
            }
          })
            .spread((staff, created) => {
              return Promise.resolve(staff.get({plain: true}))
            })
        })
        .then(res => {
          console.log('-> ', 'admin user created succesffully');
          adminUser = res;
          return Promise.resolve();
        });
    });
  })
  .then(() => {
    let actionList = [];

    Object.keys(Context).forEach(el => {
      if (!Context[el].queries)
        return;

      actionList = actionList.concat(Object.keys(Context[el].queries).map(a => {
        return {context: el, name: a};
      }));
    });

    return Promise.all(actionList.map(el => Action.model().findOrCreate({where: {context: el.context, name: el.name}})));
  })
  .then(res => {
    console.log('->  Actions are added successfully');
    let actionList = res.map(el => {
      return {action_id: el[0].id, role_id: adminRole.get({plain: true}).id}
    });

    return RoleAction.model().bulkCreate(actionList);
  })
  .then(res => {
    console.log('->  Assign all actions to Admin role');
    return Promise.all(pageList.map(x => Page.model().findOrCreate({where: {name: x.name}, defaults: {url: x.url}})));
  })
  .then(res => {
    console.log('->  Pages are added!');
    let pList = res.map(el => {
      return {page_id: el[0].id, role_id: adminRole.id};
    });
    return PageRole.model().bulkCreate(pList);
  })
  .then(() => {
    console.log('->  Assign all pages to Admin role');
    process.exit(0);
  })
  .catch(err => {
    console.error('-> ', err);
    process.exit(1);
  });