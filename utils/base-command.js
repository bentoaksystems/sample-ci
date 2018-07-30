const errors = require('./errors.list');
const db = require('../infrastructure/db');


module.exports = class BaseCommand {
  constructor() {
  }

  async execut(root, list, cb) {

    if (!root || !list)
      throw errors.commandIncompleteData;

    return db.sequelize().transaction(async () => {
      try {

        const oldVersion = root.getVersion();

        let editingRoot = Object.assign(Object.create(Object.getPrototypeOf(root)), root)
        await cb(editingRoot);

        editingRoot.checkVersion(oldVersion, list);
        return Promise.resolve();
      } catch (err) {
        throw err;
      }
    }).catch(err => {
      throw err;
    });
  }


}