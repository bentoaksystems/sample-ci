
const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db')

const queries = {
  'checkUserAuth': require('./read-side/checkUserAuth'),
  'checkUserAccess': require('./read-side/checkUserAccess'),
  'checkUserValidation': require('./read-side/checkUserIsValid')
}

const commands = {
  'newPageAssigned': require('./repositories/userRepository')
}

queryhandler = async (query, user) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  return queries[query.name](query.payload, user);

}

commandHandler = async (command, user) => {
  if (!commands[command.name])
    throw errors.commandNotFound;


  const repo = commands[command.name];

  if (!command.payload)
    throw errors.payloadIsNotDefined;

  const payload = command.payload

  return db.sequelize().transaction(function (t1) {

    switch (command) {

      case 'newPageAssigned':
        return repo.getIUserById(payload.userId)
          .then(user => {
            return user.newPageAssigned(payload.pageId)
          })
        break;
    }
  });


}

handler = async (body, user) => {

  try {
    if (body.is_command)
      return commandHandler(body, user);
    else
      return queryhandler(body, user);
  } catch (err) {
    throw err;
  }
}


module.exports = {
  handler,
  queries,
  commands
};
