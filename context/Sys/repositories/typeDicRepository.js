const ITypeDic = require('../write-side/aggregates/typeDic')
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

class TypeDicRepository {

  async  getITypeDicById(id) {
    if (!id)
      throw new Error('type dictionary id is not defined');

    const typeDic = await TypeDictionary.model().findOne({
      where: {id}
    });
    if (typeDic) {
      return new ITypeDic(typeDic);
    } else {
      throw new Error('no type dictionary found');
    }
  }

  async defineTypeDic(name, type) {
    if (!name || !type) {
      throw new Error('type dictionary name and type is required');
    }
    return TypeDictionary.model().create({
      name,
      type
    });
  }
}

module.exports = TypeDicRepository;
