const errors = require('../../utils/errors.list');

const queries = {
  'checkUserAuth': require('./read-side/checkUserAuth'),
  'checkUserAccess': require('./read-side/checkUserAccess'),
  'checkUserValidation': require('./read-side/checkUserValidation'),
  'getActions': require('./read-side/getActions'),
  'getRoles': require('./read-side/getRoles'),
  'getRoleAction': require('./read-side/getRoleAction'),
}

const commands = {
  'grantPageAccess': require('./write-side/commands/grantPageAccess')
}

queryhandler = async (query, user) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  return queries[query.name](query.payload, user);

}

commandHandler = async (command, user) => {
  if (!commands[command.name])
    throw errors.commandNotFound;

  if (!command.payload)
    throw errors.payloadIsNotDefined;

  return new commands[command.name]().execut(command.payload, user);


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