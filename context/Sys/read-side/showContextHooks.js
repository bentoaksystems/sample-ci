const contextHookRepository = require('../repositories/contextHookRepository');

module.exports = async payload => {
  try {
    const repo = new contextHookRepository();
    const context_hooks = await repo.loadHooks();
    return Promise.resolve(context_hooks);
  } catch (err) {
    throw err;
  }
};
