const TypeDictionaryRepository = require('../../Shared-Kernel/repositories/typeDicRepository');

module.exports = async () => {
  try {
    return new TypeDictionaryRepository().showSystemTypes('exit', null, null, 1000);
  } catch (err) {
    throw err;
  }
};
