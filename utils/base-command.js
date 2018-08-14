const errors = require('./errors.list');
const db = require('../infrastructure/db');


module.exports = class BaseCommand {
  constructor() {
  }

  async execute(cb) {
    return db.sequelize().transaction(async () => {
      return cb();
    });
  }
}