const errors = require('./errors.list');

module.exports = class BaseHandler {
  constructor(queries, commands) {
    this.queries = queries;
    this.commands = commands;
  }

  async queryHandler(query, user) {
    if (!this.queries[query.name])
      throw errors.queryNotFound;

    return this.queries[query.name](query.payload, user);
  }

  async commandHandler(command, user) {
    if (!this.commands[command.name])
      throw errors.commandNotFound;

    if (!command.payload)
      throw errors.payloadIsNotDefined;

    return new this.commands[command.name]().execut(command.payload, user);
  }

  async handler(body, user) {
    try {
      if (body.is_command)
        return this.commandHandler(body, user);
      else
        return this.queryHandler(body, user);
    } catch (err) {
      throw err;
    }
  }

  getQueries() {
    return this.queries;
  }

  getCommands() {
    return this.commands;
  }
};
