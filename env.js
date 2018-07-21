const bcrypt = require('bcrypt-nodejs');
const app = require('express')();
let env = app.get('env');
if (env === 'test')
  env = 'development';
const isProd = env === 'production';
const isDev = env === 'development';

/**
 * read environment variable form env.process
 * in dev or test mode the environment variables are read from .env file
 * .env file must at least contain:
 * APP_NAME
 * APP_ADDRESS
 * PORT
 * DATABASE
 * DB_URI
 * REDIS_HOST
 *
 * a .env file that might work for many:
 ** START **
 # the values must not be initiated with '!!'
 APP_NAME=Persian-Mode
 APP_ADDRESS=http://localhost:3000
 PORT=3000
 DATABASE=PersianMode
 REDIS_HOST=127.0.0.1
 # REDIS_PASSWORD=123465
 ** END **
 */
if (isDev)
  require('dotenv').config(); // loads env variables inside .env file into process.env

/**
 *  App
 */
const appName = getEnvValue(process.env.APP_NAME);
const appAddress = getEnvValue(process.env.APP_ADDRESS);
const port = getEnvValue(process.env.PORT);

/**
 * Database
 */
const database = getEnvValue(process.env.DATABASE);
const database_test = getEnvValue(process.env.DATABASE) + '_Test';
const db_host = getEnvValue(process.env.DB_HOST);
const db_username = getEnvValue(process.env.DB_USERNAME) ;
const db_password = getEnvValue(process.env.DB_PASSWORD);


const db_uri = getEnvValue(process.env.DB_URI) + database;
const db_uri_test = getEnvValue(process.env.DB_URI) + database_test;


/**
 * Redis
 */
const redisURL = getEnvValue(process.env.REDIS_URL);
const redisHost = getEnvValue(process.env.REDIS_HOST);
const redisPort = getEnvValue(process.env.REDIS_PORT);
const redisPass = getEnvValue(process.env.REDIS_PASSWORD);


/**
 *  in some cases env var name which is declared in .env file is not compatible with server env var in production mode.
 *  for example in Heroku the name of env var for database connection is DATABASE_URL, but it is declared as pg_connection in .env file
 *  To resolve this if the name of env var contains !! at first, its value will be extracted from name after this two character
 * @param procEnv
 * @returns {*}
 */
function getEnvValue(procEnv) {
  if (procEnv && procEnv.startsWith('!!'))
    return process.env[procEnv.substring(2)]; // remove two first char (!!)
  else
    return procEnv;
}


module.exports = {
  bcrypt,
  isProd: isProd,
  isDev: isDev,
  appAddress,
  appName,
  app,
  port,
  database,
  database_test,
  db_uri,
  db_uri_test,
  db_host,
  db_username,
  db_password,
  redisURL,
  redisHost,
  redisPort,
  redisPass,
};


