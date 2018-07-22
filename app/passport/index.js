const passport = require('passport');
const LocalStrategy = require('passport-local');
const env = require('../../env');
const authHandler = require('./authHandler');

let setup = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(authHandler.serialize);
  passport.deserializeUser(authHandler.deserialize);
  passport.use(new LocalStrategy(
    {
      passReqToCallback: true,
    },
    authHandler.localStrategy,
  ));
}

module.exports = {
  setup,
};