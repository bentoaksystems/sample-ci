const fs = require('fs');

let serverHost = 'his';
let dbHost = 'db';
let redisHost = 'redis';

let serverPort = 80;
let dbPort = 5432;
let redisPort = 6379;

let appAddress = `http://${serverHost}:${process.env.PORT}`

let appName, port, database, dbUser, dbPass

let env = 'production';

const main = async () => {

  try {

    appName = process.env.APP_NAME;
    port = process.env.PORT;
    database = process.env.DATABASE;
    dbUser = process.env.DB_USER;
    dbPass = process.env.DB_PASS;

    const mode = process.argv[2];



    if (mode != 'production') {
      dbHost = process.env.DB_HOST;
      serverHost = process.env.SERVER_HOST;
      redisHost = process.env.REDIS_HOST;
      serverPort += Number.parseInt(process.env.BUILD_NUMBER);
      dbPort += Number.parseInt(process.env.BUILD_NUMBER);;
      redisPort += Number.parseInt(process.env.BUILD_NUMBER);;
      env = process.env.NODE_ENV;
      appAddress = process.env.APP_ADDRESS;
    }
    else {
      dbHost += '-' + serverHost;
      redisHost += '-' + serverHost;
    }


    const template = makeTemplate();
    console.log('-> ', template);
    fs.writeFileSync('./docker-compose.yml', template, 'utf8');

  } catch (err) {
    console.error('-> error: ', err);
  }

}

const makeTemplate = () => {

  return `
  version: '3'
  services:
    redis:
      container_name: ${redisHost}
      image: "redis:alpine"
      ports:
       - "${redisPort}:6379"
    db:
      container_name: ${dbHost}
      image: "postgres:10"
      ports:
       - "${dbPort}:5432"
      environment:
       - POSTGRES_PASSWORD=${dbPass}
       - POSTGRES_USER=${dbUser}
    web:
      build: .
      container_name: ${serverHost}
      image: ${serverHost}
      ports:
       - "${serverPort}:3000"
      volumes:
       - .:/usr/src/app
      environment:
       - NODE_ENV=${env}
       - APP_NAME=${appName}
       - APP_ADDRESS=${appAddress}
       - PORT=${port}
       - DATABASE=${database}
       - DB_HOST=${dbHost}
       - DB_PORT=${dbPort}
       - DB_USER=${dbUser}
       - DB_PASS=${db}
       - REDIS_HOST=${redisHost}
       - REDIS_PORT=${redisPort}
      depends_on:
       - redis
       - db
      command: bash -c "node configure.js; npm start"
  `
}

main();


