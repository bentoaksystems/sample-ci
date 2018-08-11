const ContextRepository = require('../repositories/contextRepository');

module.exports = async payload => {
  try {
    const repo = new ContextRepository();
    const context_hooks = await repo.loadHooks();
    return Promise.resolve(context_hooks);
  } catch (err) {
    throw err;
  }
};
