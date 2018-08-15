const fs = require('fs');

let serverHost;
let dbHost;
let redisHost;

let serverPort;
let dbPort;
let redisPort;

let appAddress;

let env;

const main = async () => {

  try {

    const mode = process.argv[2];

    if (mode != 'production') {
      dbHost = process.env.DB_HOST;
      serverHost = process.env.SERVER_HOST;
      redisHost = process.env.REDIS_HOST;
      serverPort = process.env.SERVER_PORT + Number.parseInt(process.env.BUILD_NUMBER);
      dbPort = process.env.DB_PORT + Number.parseInt(process.env.BUILD_NUMBER);;
      redisPort = process.env.REDIS_PORT + Number.parseInt(process.env.BUILD_NUMBER);;
      env = process.env.NODE_ENV;
      appAddress = process.env.APP_ADDRESS;
    }
    else {

      serverHost = 'his'
      dbHost = 'db-' + serverHost;
      redisHost = 'redis-' + serverHost;
      serverPort = process.env.SERVER_PORT;
      dbPort = process.env.DB_PORT;
      redisPort = process.env.REDIS_PORT;
      appAddress = `http://${serverHost}:${serverPort}`
      env = 'production'
    }


    const template = makeTemplate();
    console.log('-> ', template);
    fs.writeFileSync('./docker-compose.yml', template, 'utf8');

  } catch (err) {
    console.error('-> error: ', err);
    process.exit(1);
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
       - APP_NAME=${process.env.APP_NAME}
       - PORT=${process.env.PORT}
       - DATABASE=${process.env.DATABASE}
       - APP_ADDRESS=${appAddress}
       - DB_USER=${process.env.DB_USER}
       - DB_PASS=${process.env.DB_PASS}
       - DB_HOST=${dbHost}
       - DB_PORT=${process.env.DB_PORT}
       - REDIS_HOST=${redisHost}
       - REDIS_PORT=${process.env.REDIS_PORT}
      depends_on:
       - redis
       - db
      command: bash -c "node configure.js; npm start"
  `
}

main();


