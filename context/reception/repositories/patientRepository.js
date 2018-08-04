const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDocument = require('../../../infrastructure/db/models/emrdoc.model');
const Address = require('../../../infrastructure/db/models/address.model');
const IPatient = require('../write-side/aggregates/patient');

module.exports = class PatientRepository {

  constructor() {

  }

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

  async findOrCreatePatient(id) {
    const user = await Person.model().findOne({
      where: {id},
      include: [
        {
          model: EMR.model(),
          required: true,
          include: [
            {
              model: EMRDocument.model(),
            }
          ]
        }
      ]
    });
    return user ? new IPatient(id, user.emr, user.emr_docs) : new IPatient();
  }

  async addPatient(patient, address) {
    let patientData = {};
    patientData.address = (await Address.model().create(address)).get({plain: true});
    patient.address_id = patientData.address.id;
    const pd = (await Person.model().create(patient)).get({plain: true});
    patientData = Object.assign(patientData, pd);
    patientData.emr = (await EMR.model().create({person_id: patientData.id})).get({plain: true});
    return Promise.resolve(patientData);
  }

  async updatePatient(id, patient) {
    return Person.model().update({where: {id}}, patient);
  }

  async addDocumentToPatientEMR(id, document_id, emr_type_id) {
    if (!id || !document_id)
      throw new Error('document id or emr id is not set');

    return EMRDocument.model().findOrCreate({
      where: {
        document_id: document_id,
        emr_id: id
      },
      defaults: {emr_type_id: emr_type_id}
    });
  }
};
