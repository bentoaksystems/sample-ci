const bluebird = require('bluebird');
const redis_socket = require('socket.io-redis');
const redis = require('redis');
const env = require('../../env');

let redisIsReady = false;
let redis_client, redis_sub;

let redisClientInit = () => {
  return new Promise((resolve, reject) => {
    if (!redisIsReady && !redis_client && !redis_sub) {
      let option = {
        host: env.redisHost,
        socket_keepalive: true,
      };

      if (env.redisPass)
        option['password'] = env.redisPass;

      let conn = env.redisURL ? env.redisURL : option;
      redis_client = redis.createClient(conn);
      redis_sub = redis.createClient(conn);

      bluebird.promisifyAll(redis.RedisClient.prototype);
      bluebird.promisifyAll(redis.Multi.prototype);

      redis_client.on('ready', () => {
        console.log('Redis is ready!!!');
        redisIsReady = true;
        resolve();
      });

      redis_client.on('error', err => {
        console.log('Redis is down. The error message is ', err);
        redisIsReady = false;
        reject();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  redisClientInit,
  redisIsReady: () => redisIsReady,
  redis_client: () => redis_client,
  redis_sub: () => redis_sub,
  redis_socket,
};