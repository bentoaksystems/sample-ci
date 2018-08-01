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

  async getPatientById(person_id) {
    const user = await Person.model().find({
      where: {id: person_id}
    })
    if (user) {
      return new IPerson(user.id);
    } else {
      throw new Error('no person found');
    }
  }

  makeEmptyPatient() {
    return new IPerson();
  }

  creatPatient(person) {
    return Person.model().create(person);
  }

  updatePatient(person) {
    return Person.model().update({where: {id: person.id}}, person);
  }
}

module.exports = PersonRepository;
