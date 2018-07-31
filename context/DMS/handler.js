const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db');

const queries = {

};

const commands = {
  'uploadDocument': require('./write-side/commands/documentUploaded'),
};

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

  return db.sequelize().transaction(function (t1) {
    return commands[command.name](command.payload, user);
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
  commands,
  queries,
};
