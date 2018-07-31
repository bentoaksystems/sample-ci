const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');

class PersonRepository {

  async getPatients() {
    if (!username)
      throw new Error('username is not defined');

    const query = {};
    query.include = [
      {
        model: EMR.model(),
        required: true,
      }
    ];

    return Person.model().findAll(query);
  }

}

module.exports = PersonRepository;
