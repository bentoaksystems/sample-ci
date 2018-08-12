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
      container_name: redis-${process.env.BUILD_NUMBER}
      image: "redis:alpine"
      ports:
       - "${redisPort}:6379"
    db:
      container_name: db-${process.env.BUILD_NUMBER}
      image: "postgres:10"
      ports:
       - "${dbPort}:5432"
      environment:
       - POSTGRES_PASSWORD=${process.env.DB_PASS}
       - POSTGRES_USER=${process.env.DB_USER}
       - POSTGRES_DB: his
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
       - APP_NAME=HIS
       - APP_ADDRESS=http://173.249.11.153
       - PORT=3000
       - DATABASE=his
       - DB_HOST=db-${process.env.BUILD_NUMBER}
       - DB_PORT=${dbPort}
       - DB_USER=${process.env.DB_USER}
       - DB_PASS=${process.env.DB_PASS}
       - REDIS_HOST=redis-${process.env.BUILD_NUMBER}
       - REDIS_PORT=${redisPort}
      depends_on:
       - redis
       - db
      command: bash -c "node configure.js"
  `
}

main();


