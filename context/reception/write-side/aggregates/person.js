module.exports = class Person {

  constructor(id) {
    this.id = id;
  }

  async updatePatientData(payload) {
    console.log(8,payload);
    const PersonRepository = require('../../repositories/personRepository');
    const personRipositroy = new PersonRepository();
    const person = {
      id: payload.id,
    };
    if (payload.firstname)
      person['firstname'] = payload.firstname;
    if (payload.firstname)
      person['surname'] = payload.surname;
    if (payload.firstname)
      person['national_code'] = payload.national_id;
    if (payload.firstname)
      person['phone_number'] = payload.phone;
    if (payload.firstname)
      person['mobile_number'] = payload.mobile;
    if (payload.firstname)
      person['title'] = payload.title;
    return personRipositroy.updatePatient(person);
  }

  async createNewPatient(payload) {
    const PersonRepository = require('../../repositories/personRepository');
    const personRipositroy = new PersonRepository();
    const person = {
      firstname: payload.firstname,
      surname: payload.surname,
      title: payload.title,
      national_code: payload.national_id,
      phone_number: payload.phone,
      mobile_number: payload.mobile,
    };
    return personRipositroy.creatPatient(person);


  }
}