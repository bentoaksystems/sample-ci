const errors = require('./errors.list');
const db = require('../infrastructure/db');


module.exports = class BaseCommand {
  constructor() {
  }

  async execut(cb) {

    if (!root || !list)
      throw errors.commandIncompleteData;

    return db.sequelize().transaction(async () => {
      try {

        await cb();
        return Promise.resolve();
      } catch (err) {
        throw err;
      }
    }).catch(err => {
      throw err;
    });
  }


}