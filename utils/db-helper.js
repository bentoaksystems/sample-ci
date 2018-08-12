const env = require('../env');
const {Client} = require('pg');
const bycript = require('./bcrypt');

const Role = require('../infrastructure/db/models/role.model');
const Person = require('../infrastructure/db/models/person.model');
const Staff = require('../infrastructure/db/models/staff.model');
const User = require('../infrastructure/db/models/user.model');
const Page = require('../infrastructure/db/models/page.model');
const RolePage = require('../infrastructure/db/models/page_role.model');
const RoleAction = require('../infrastructure/db/models/role_action');
const rp = require('request-promise');
const db = require('../infrastructure/db');

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

  let person, role, staff, user;
  return Person.model().findOrCreate({
    where: {firstname: 'Admin', surname: 'Admin'},
    defaults: {
      national_code: '-',
      mobile_number: '091234567890',
      phone_number: '02188776655',
    }
  })
    .spread((person, created) => {
      return Promise.resolve(person);
    })
    .then(res => {
      person = res;
      return Role.model().findOrCreate({where: {name: 'Admin'}})
        .spread((role, created) => {
          return Promise.resolve(role);
        })
    })
    .then(res => {
      role = res;
      return Staff.model().findOrCreate({where: {role_id: role.id, person_id: person.id}})
        .spread((staff, created) => {
          return Promise.resolve(staff);
        });
    })
    .then(res => {
      staff = res;
      return bycript.genSalt(password);
    })
    .then(hash => {
      return User.model().findOrCreate({
        where: {person_id: person.id},
        defaults: {
          username,
          password: hash
        }
      })
        .spread((user, created) => {
          return Promise.resolve(user);
        });
    })
    .then(res => {
      user = res;
      return Promise.resolve({person, role, staff, user})
    })
}

const addUser = async (username = 'test_user', password = '123456', roles = []) => {
  const person = await Person.model().create({
    firstname: 'test firstname',
    surname: 'test surname',
  });

  roles = roles.length ? roles : [{name: 'test role'}];
  const _roles = await Role.model().bulkCreate(roles);
  const staffList = _roles.map(el => {
    return {
      role_id: el.id,
      person_id: person.id,
    }
  });

  const _staffList = await Staff.model().bulkCreate(staffList)
  const hash = await bycript.genSalt(password);
  const user = await User.model().create({
    person_id: person.id,
    username,
    password: hash
  })
  return Promise.resolve({person, roles: _roles, staff: _staffList, user});
}


addAndLoginUser = async (isAdmin = false, username, password = '123456', roles = []) => {
  try {
    let addedUser = isAdmin ? await addAdmin() : await addUser(username, password, roles);
    const rpJar = rp.jar();

    const res = await rp({
      method: 'POST',
      uri: `${env.appAddress}/api/login`,
      body: {
        username: addedUser.user.username,
        password: password
      },
      json: true,
      withCredentials: true,
      jar: rpJar,
      resolveWithFullResponse: true
    })
    if (res.statusCode === 200) {
      return Promise.resolve({userId: addedUser.user.id, rpJar});
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

assignActionToRole = (role_id, action_id, access = null) => {
  return RoleAction.model().create({
    role_id,
    action_id,
    access,
  });
}

module.exports = {
  create,
  addAdmin,
  addUser,
  addPage,
  assignPageToRole,
  addAndLoginUser,
  assignActionToRole
}