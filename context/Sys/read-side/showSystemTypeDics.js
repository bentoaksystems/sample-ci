const TypeDicRepository = require('../../Shared-Kernel/repositories/typeDicRepository');
module.exports = async (payload) => {

  if (!payload)
    payload = {};

  return new TypeDicRepository().showSystemTypes(payload.type, payload.name, payload.offset, payload.limit);
}