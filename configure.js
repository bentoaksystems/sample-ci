const db = require('./infrastructure/db/index');
const dbHelper = require('./utils/db-helper');
const Role = require('./infrastructure/db/models/role.model');
const Staff = require('./infrastructure/db/models/staff.model');
const Person = require('./infrastructure/db/models/person.model');
const User = require('./infrastructure/db/models/user.model');


let adminRole, adminStaff, adminUser;
dbHelper.create(false)
  .then(res => {
    return db.isReady(false);
  })
  .then(result => {
    console.log('-> ', 'database created successfully :)');
  })
  .then(res => {
    // make admin role
    return Role.model().findOrCreate({where: {name: 'Admin'}})
      .spread((role, created) => {
        return Promise.resolve(role);
      })
  })
  .then(res => {

    adminRole = res;
    console.log('-> ', 'admin role created successfully');
    return Staff.model().findOne({
      where: {role_id: adminRole.get({plain: true})}.id,
      include: [{model :Person.model()}]
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

    return User.model().findOrCreate({
      where: {staff_id: adminStaff.get({plain: true}).id},
      defaults: {
        username: 'admin',
        password: 'admin@123'
      }
    })
      .spread((staff, created) => {
        return Promise.resolve(staff.get({plain: true}))
      })
  })
  .then(res => {
    console.log('-> ', 'admin user created succesffully');
    adminUser = res;

  })

  .catch(err => {
    console.error('-> ', err);

  });