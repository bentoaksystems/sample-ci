const env = require('../env');
const {Client} = require('pg')

const create = async (isTest) => {

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


module.exports ={
  create
}