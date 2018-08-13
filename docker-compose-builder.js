const fs = require('fs');

const main = async () => {

  try {

    serverPort = 3000 + Number.parseInt(process.env.BUILD_NUMBER);
    dbPort = 5432 + Number.parseInt(process.env.BUILD_NUMBER);;
    redisPort = 6379 + Number.parseInt(process.env.BUILD_NUMBER);;

    const template = makeTemplate(serverPort, dbPort, redisPort);
    fs.writeFileSync('./docker-compose.yml', template, 'utf8');

  } catch (err) {

    console.error('-> error: ', err);
  }

}

const makeTemplate = (serverPort, dbPort, redisPort) => {

  return `
  version: '3'
  services:
    redis:
      container_name: ${process.env.REDIS_HOST}
      image: "redis:alpine"
      ports:
       - "${redisPort}:6379"
    db:
      container_name: ${process.env.DB_HOST}
      image: "postgres:10"
      ports:
       - "${dbPort}:5432"
      environment:
       - POSTGRES_PASSWORD=${process.env.DB_PASS}
       - POSTGRES_USER=${process.env.DB_USER}
      ${
    process.env.NODE_ENV !== 'production' ? '' :
      `volumes:
          - ./pgdata:/var/lib/postgresql/data`
    }
    web:
      build: .
      container_name: his-${process.env.BUILD_NUMBER}
      image: his-${process.env.BUILD_NUMBER}
      ports:
       - "${serverPort}:3000"
      volumes:
       - .:/usr/src/app
      environment:
       - APP_NAME=${process.env.APP_NAME}
       - APP_ADDRESS=${process.env.APP_ADDRESS}
       - PORT=${process.env.PORT}
       - DATABASE=${process.env.DATABASE}
       - DB_HOST=${process.env.DB_HOST}
       - DB_PORT=${process.env.DB_PORT}
       - DB_USER=${process.env.DB_USER}
       - DB_PASS=${process.env.DB_PASS}
       - REDIS_HOST=${process.env.REDIS_HOST}
       - REDIS_PORT=${process.env.REDIS_PORT}
      depends_on:
       - redis
       - db
      command: bash -c "node configure.js; npm run server_test"
  `
}

main();


