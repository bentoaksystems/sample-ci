const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');


class TypeDicRepository {
  showSystemTypes(type = null, name= null, offset = 0, limit = 10) {

    const query = {
      offset,
      limit,
      where: {},
      order: [
        ['name', 'DESC'],
      ]
    };
    if (type) {
      query.where.type = type
    }
    if (name) {
      query.where.name = {
        [Op.like]: `%${name}%`
      }
    }
    return TypeDictionary.model().findAndCountAll(query)
      .then(result => {
        return Promise.resolve({count: result.count, types: result.rows})
      });
  }
}

module.exports = TypeDicRepository;