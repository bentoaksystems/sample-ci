const fs = require('fs');

let serverPort = 80;
let dbPort = 5432;
let redisPort = 6379;
let serverHost = 'his';
let dbHost = 'db-';
let redisHost = 'redis-';
let env = 'production';
let appAddress = `http://${serverHost}:${process.env.PORT}`

const main = async () => {

  try {

    const mode = process.argv[2];

    if (mode != 'production') {
      serverPort += Number.parseInt(process.env.BUILD_NUMBER);
      dbPort += Number.parseInt(process.env.BUILD_NUMBER);;
      redisPort += Number.parseInt(process.env.BUILD_NUMBER);;
      dbHost = process.env.DB_HOST;
      redisHost = process.env.REDIS_HOST;
      env = process.env.NODE_ENV;
      appAddress = process.env.APP_ADDRESS;
    }
    else {
      dbHost += serverHost;
      redisHost += serverHost;

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
       - POSTGRES_PASSWORD=${process.env.DB_PASS}
       - POSTGRES_USER=${process.env.DB_USER}
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
       - APP_ADDRESS=${appAddress}
       - PORT=${process.env.PORT}
       - DATABASE=${process.env.DATABASE}
       - DB_HOST=${dbHost}
       - DB_PORT=${dbPort}
       - DB_USER=${process.env.DB_USER}
       - DB_PASS=${process.env.DB_PASS}
       - REDIS_HOST=${redisHost}
       - REDIS_PORT=${redisPort}
      depends_on:
       - redis
       - db
      command: bash -c "node configure.js; npm start"
  `
}

main();


