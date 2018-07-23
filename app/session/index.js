const env = require('../../env');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const redis = require('../../infrastructure/redis');
let session_config;

let setup = (app) => {
  return new Promise((resolve, reject) => {
    redis.redisClientInit()
      .then(() => {
        let option = {
          'client': redis.redis_client(),
          'host': env.redisHost,
          'port': env.redisPort,
        };

        let conn = env.redisURL ? env.redisURL : option;
        let sessionStore = new redisStore(conn);

        // Initialize session with setting for production
        session_config = {
          secret: 'ManCh3D0N^M',
          key: 'connet.sid',
          cookie: {
            maxAge: 14 * 24 * 3600 * 1000,
          },
          store: sessionStore,
          resave: false,
          saveUninitialized: false,
        };

        if(env.isProd) {
          app.set('trust proxy', 1); //Trust first proxy
          session_config.cookie.secure = true; //Serve secure cookies          
        }

        app.use(session(session_config));

        console.log('Session is set up successfully.');

        resolve();
      })
      .catch(err => {
        console.log('Error in connecting redis: ', err);
        process.exit(1);
      });
  });
};

module.exports = {
  setup,
  session_config: () => session_config,
};