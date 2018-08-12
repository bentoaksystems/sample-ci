const env = require('../env');
const {Client} = require('pg');
const bycript = require('./bcrypt');

const Role = require('../infrastructure/db/models/role.model');
const Person = require('../infrastructure/db/models/person.model');
const Staff = require('../infrastructure/db/models/staff.model');
const User = require('../infrastructure/db/models/user.model');
const Page = require('../infrastructure/db/models/page.model');
const RolePage = require('../infrastructure/db/models/page_role.model');
const rp = require('request-promise');

const create = async (isTest = false) => {

  const config = {
    user: env.db_username,
    host: env.db_host,
    database: 'postgres',
    password: env.db_password,
    port: env.db_port
  }

  let client;
  let isReady = false;

  sleep = (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time)
    })
  }

  while (!isReady) {

    try {
      client = new Client(config);
      await client.connect()
      await client.query(`CREATE DATABASE ${isTest ? env.database_test : env.database}`)
      console.log('-> ', `database ${isTest ? env.database_test : env.database} created successfully :)`);
      isReady = true;
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('-> ', `database ${isTest ? env.database_test : env.database} already exists!`);
        isReady = true
      }
      else {
        console.error('-> ', err);
        await client.end();
        await sleep(5000);
        isReady = false;
      }
    }
  }
 
  try {
    await client.end();
    return Promise.resolve();

  } catch (err) {
    console.log('-> ', err);
    return Promise.reject(err);
  }

}

/**
 * do not use await here. it is used inside transaction in configure.js
 */
const addAdmin = async (username = 'admin', password = '123456') => {

  let person, role, staff, user;
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
    person_id: person.id,
    username,
    password: hash
  })
  return Promise.resolve({person, role, staff, user});

}


addAndLoginUser = async (isAdmin = false, username, password = '123456') => {

  try {
    let addedUser = isAdmin ? await addAdmin() : await addUser();
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

module.exports = {
  create,
  addAdmin,
  addUser,
  addPage,
  assignPageToRole,
  addAndLoginUser
}