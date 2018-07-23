const SysContextHandler = require('../../context/Sys/handler');
const errors = require('../../utils/errors.list');

let localStrategy = (req, username, password, done) => {
  SysContextHandler({
    is_command: false,
    payload: {
      username: username,
      password: password,
    },
    name: 'loginUser',
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
    payload: {id},
    name: 'userCheck',
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
      console.error('Error in desrialized function: ', err.message);
      done(err);
    });
};

module.exports = {
  localStrategy,
  serialize,
  deserialize,
};