const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const IPatient = require('../write-side/aggregates/patient');

module.exports = class PatientRepository {

  /*
   * QUERY RELATED REPOSITORIES:
   */

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

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
   * e.g: IUser  = require ('../write-side/aggregates/user.js')
   * 
   * **/

  async findPatientById(id) {
    const user = await Person.model().findOne({where: {id}});
    return new IPatient(user ? id : null);
  }

  async addPatient(patient) {
    let patientData = {};
    return Person.model().create(patient)
      .then(res => {
        patientData = res;
        return EMR.model().create({person_id: res.id});
      })
      .then(res => {
        return Promise.resolve(Object.assign(patientData, {emr: res}));
      });
  }

  async updatePatient(id, patient) {
    return Person.model().update({where: {id}}, patient);
  }
};
