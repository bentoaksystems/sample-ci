const env = require('../env');
const {Client} = require('pg');
const bycript = require('./bcrypt');

const Role = require('../infrastructure/db/models/role.model');
const Person = require('../infrastructure/db/models/person.model');
const Staff = require('../infrastructure/db/models/staff.model');
const User = require('../infrastructure/db/models/user.model');

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


const addAdmin = () => {

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
      return bycript.genSalt('admin@123');
    })
    .then(hash => {
      return User.model().findOrCreate({
        where: {staff_id: adminStaff.id},
        defaults: {
          username: 'admin',
          password: hash
        }
      })
        .spread((user, created) => {
          return Promise.resolve(user);
        });
    })
    .then(res => Promise.resolve({adminPerson, adminRole, adminStaff, adminUser}))
}






module.exports = {
  create,
  addAdmin
}