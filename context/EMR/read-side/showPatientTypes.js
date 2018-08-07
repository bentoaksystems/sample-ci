const TypeDictionaryRepository = require('../../Shared-Kernel/repositories/typeDicRepository');

module.exports = async () => {
  try {
    return new TypeDictionaryRepository().showSystemTypes('patient', null, null, 1000);
  } catch(err) {
    throw err;
  }
}