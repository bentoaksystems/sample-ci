const SysContextHandler = require('../../context/Sys/handler').handler;
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
    payload: {
      id,
      name: req.body.name,
      context: req.body.context,
    },
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
      if (id) {
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

// let afterLogin = () => {
//   return (req, res) => {
//     const user = req.user;
//     if (!req.user)
//       res.status(errors.noUser.status).json(errors.noUser.message);
//     else {
//       let userObj = {
//         id: user.id,
//         username: user.username,
//         firstname: user.person.firstname,
//         surname: user.person.surname,
//         title: user.person.title,
//         accessed_routes: user.pages,
//         roles: user.roles,
//       }

//       res.status(200).json(userObj);
//     }
//   }
// }

module.exports = {
  localStrategy,
  serialize,
  deserialize,
  // afterLogin,
};