const passport = require('passport');
const LocalStrategy = require('passport-local');
const env = require('../../env');

let setup = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser();
  passport.deserializeUser();
  passport.use(new LocalStrategy(
    {
      passReqToCallback: true,
    },
    //LocalStrategy in sys context
  ));
}

module.exports = {
  setup,
};