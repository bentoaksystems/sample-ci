const SysContextHandler = require('../../context/Sys/handler').handler;
const errors = require('../../utils/errors.list');

let localStrategy = (req, username, password, done) => {
  SysContextHandler({
    is_command: false,
    payload: {
      username: username,
      password: password,
    },
    name: 'checkUserAuth',
  })
    .then(foundPerson => {
      delete foundPerson.password;
      done(null, foundPerson);
    })
    .catch(err => {
      console.error('Error in passport localStrategy: ', err);
      done(err);
    });
}

let serialize = (person, done) => {
  done(null, person.id);
};

let deserialize = (req, id, done) => {

  SysContextHandler({
    is_command: false,
    payload: {
      id,
      name: req.body.name,
      context: req.body.context,
    },
    name: 'checkUserAccess',
  })
    .then(foundPerson => {
      if (id && !foundPerson) {
        req.logout();
        done(errors.noUser);
      } else if (!foundPerson) {
        done(errors.noUser);
      } else {
        delete foundPerson.password;
        done(null, foundPerson);
      }
    })
    .catch(err => {
      if (id) {
        console.error('-> ', err);

        if (err.status === errors.noUser.status && err.message === errors.noUser.message) {
          req.logout();
          done(errors.noUser);
        } else
          done(err);
      } else {
        console.error('Error in desrialized function: ', err.message);
        done(err);
      }
    });
};

module.exports = {
  localStrategy,
  serialize,
  deserialize,
};