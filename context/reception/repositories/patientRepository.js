const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDocument = require('../../../infrastructure/db/models/emrdoc.model');
const Address = require('../../../infrastructure/db/models/address.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const IPatient = require('../write-side/aggregates/patient');
const db = require('../../../infrastructure/db');

module.exports = class PatientRepository {

  constructor() {

  }

  /*
   * QUERY RELATED REPOSITORIES:
   */


  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
   * e.g: IUser  = require ('../write-side/aggregates/user.js')
   * 
   * **/

  async findOrCreatePatient(id) {
    let user = (await Person.model().findOne({
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
        },
        {
          model: Address.model(),
        }
      ]
    }));

    user = user ? user.get({plain: true}) : null;

    return user ? new IPatient(id, user.emr, user.emr.emrdocs, user.address) : new IPatient();
  }

  async addPatient(patient, address, patientTypeId) {
    let patientData = (await Person.model().create(patient)).get({plain: true});
    patientData.address = (await Address.model().create(Object.assign(address, {person_id: patientData.id}))).get({plain: true});
    patientData.emr = (await EMR.model().create({person_id: patientData.id, patient_type_id: patientTypeId})).get({plain: true});
    return Promise.resolve(patientData);
  }

  async updatePatientAddress(id, address) {
    if (!id)
      throw new Error("patient's address id cannot be undefined");

    if (!Object.keys(address).length)
      return Promise.resolve();

    return Address.model().update(address, {where: {id}});
  }

  async updatePatientInformation(id, patient) {
    if (!id)
      throw new Error("patient's id cannot be undefined");

    if (!Object.keys(patient).length)
      return Promise.resolve();

    return Person.model().update(patient, {where: {id}});
  }

  async updatePatientEMR(id, emr) {
    if (!id)
      throw new Error("patient's id cannot be undefined");

    if (!Object.keys(emr).length)
      return Promise.resolve();

    return EMR.model().update(emr, {
      where: {
        person_id: id,
        exit_type_id: {
          [db.Op.eq]: null,
        },
        exit_date: {
          [db.Op.eq]: null,
        }
      }
    });
  }

  async addDocumentToPatientEMR(emr_id, document_id, emr_doc_type_id) {
    if (!emr_id || !document_id)
      throw new Error('document id or emr id is not set');

    return EMRDocument.model().findOrCreate({
      where: {
        document_id,
        emr_id
      },
      defaults: {emr_doc_type_id: emr_doc_type_id}
    })
      .spread((results, metadata) => {
        return Promise.resolve(results.get({plain: true}));
      });
  }

  async removePatient(id) {
    return Person.model().findOne({
      where: {id},
      include: [
        {
          model: EMR.model(),
        }
      ]
    })
      .then(res => {
        if (res.exit_type_id || res.exit_date)
          throw new Error("Patient is exited before. Cannot exit again");
        return Person.model().destroy({where: {id}});
      })
  }
};
