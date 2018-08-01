const errors = require('./errors.list');
const db = require('../infrastructure/db');


module.exports = class BaseCommand {
  constructor() {
  }

  async execut(cb) {
    return db.sequelize().transaction(async () => {
      return cb();
    });
  }
}