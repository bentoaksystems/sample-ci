const env = require('../env');
const {Client} = require('pg');
const bycript = require('./bcrypt');

const Role = require('../infrastructure/db/models/role.model');
const Person = require('../infrastructure/db/models/person.model');
const Staff = require('../infrastructure/db/models/staff.model');
const User = require('../infrastructure/db/models/user.model');
const Page = require('../infrastructure/db/models/page.model');
const RolePage = require('../infrastructure/db/models/page_role.model');

const create = async (isTest = false) => {

  const config = {
    user: env.db_username,
    host: env.db_host,
    database: 'postgres',
    password: env.db_password,
  }

  const client = new Client(config);
  await client.connect();

  try {
    await client.query(`CREATE DATABASE ${isTest ? env.database_test : env.database}`)
  }
  catch (err) {
  }
  await client.end();
  return Promise.resolve();

}

/**
 * do not use await here. it is used inside transaction in configure.js
 */
const addAdmin = async (username = 'admin', password = '123456') => {

  let adminPerson, adminRole, adminStaff, adminUser;
  return Person.model().findOrCreate({
    where: {firstname: 'Admin', surname: 'Admin'},
    defaults: {
      national_code: '-'
    }
  })
    .spread((person, created) => {
      return Promise.resolve(person);
    })
    .then(res => {
      adminPerson = res;
      return Role.model().findOrCreate({where: {name: 'Admin'}})
        .spread((role, created) => {
          return Promise.resolve(role);
        })
    })
    .then(res => {
      adminRole = res;
      return Staff.model().findOrCreate({where: {role_id: adminRole.id, person_id: adminPerson.id}})
        .spread((staff, created) => {
          return Promise.resolve(staff);
        });
    })
    .then(res => {
      adminStaff = res;
      return bycript.genSalt(password);
    })
    .then(hash => {
      return User.model().findOrCreate({
        where: {staff_id: adminStaff.id},
        defaults: {
          username,
          password: hash
        }
      })
        .spread((user, created) => {
          return Promise.resolve(user);
        });
    })
    .then(res => Promise.resolve({adminPerson, adminRole, adminStaff, adminUser}))
}

const addUser = async (username = 'test_user', password = '123456') => {

  const person = await Person.model().create({
    firstname: 'test firstname',
    surname: 'test surname',
    national_code: '1234567899'
  });

  const role = await Role.model().create({
    name: 'test role',
  });
  const staff = await Staff.model().create({
    role_id: role.id,
    person_id: person.id
  });
  const hash = await bycript.genSalt(password);
  const user = User.model().create({
    staff_id: staff.id,
    username,
    password: hash
  })
  return Promise.resolve({person, role, staff, user});

}


addAndLoginUser = async (isAdmin = false, username, password = '123456') => {

  try {
    let addedUser = isAdmin ? await addAdmin() : await addUser();
    const rpJar = rp.jar();
    const userId = addedUser.user.id;
    return rp({
      method: 'POST',
      uri: helpers.apiTestURL('agent/login'),
      body: {
        username: addedUser.user.username,
        password: password
      },
      json: true,
      withCredentials: true,
      jar: rpJar,
    })
    if (res.statusCode === 200) {
      return Promise.resolve({userId, rpJar});
    } else {
      console.log('-> ', res.statusCode, res.body);
      throw new Error('could not login with this user name and password');
    }
  }
  catch (err) {
    console.error('-> could not login:\n ', err);
    throw err;
  }

}

addPage = (name = 'test page', url = '/test') => {
  return Page.model().create({
    name,
    url
  })
}

assignPageToRole = (role_id, page_id, access = null) => {
  return RolePage.model().create({
    role_id,
    page_id,
    access
  })
}

module.exports = {
  create,
  addAdmin,
  addUser,
  addPage,
  assignPageToRole,
  addAndLoginUser
}