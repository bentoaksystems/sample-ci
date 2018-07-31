const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const IPerson = require('../write-side/aggregates/person')

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

  makeEmptyPerson() {
    return new IPerson();
  }

  createPerson(person) {
    return Person.model().create(person)  ;
  }
}

module.exports = PersonRepository;
