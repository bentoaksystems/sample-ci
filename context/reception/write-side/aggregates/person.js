module.exports = class Person {

  constructor(id) {
    this.id = id;
  }

  async createNewPerson(payload) {
    const PersonRepository = require('../../repositories/personRepository');
    const personRipositroy = new PersonRepository();
    const person={
      title:payload.title,
      firstname:payload.firstname,
      surname:payload.surname,
      national_code:payload.national_code,

    };
    return personRipositroy.createPerson(person);


  }
}