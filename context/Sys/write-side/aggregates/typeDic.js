
module.exports = class TypeDic {

  constructor(id, name, type) {

    this.id = id;
    this.name = name;
    this.type = type;
  }

  typeDicDefined() {
    if (!name || !type) {
      throw new Error('type dictionary name and type is required');
    }

    const TypeDicRepository = require('../../repositories/typeDicRepository');
    const typeDicRepository = new TypeDicRepository();

    return typeDicRepository.defineTypeDic(this.name, this.type);
  }

}
