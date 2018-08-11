const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helper = require('../../../utils/helpers');
const env = require('../../../env');
const db = require('../../../infrastructure/db');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDocs = require('../../../infrastructure/db/models/emrdoc.model');
const Document = require('../../../infrastructure/db/models/document.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Exit Patient', () => {
  let userId, rpJar, patient, exitedPatient;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // Add patient
    const pType = (await TypeDictionary.model().create({name: 'دیالیزی', type: 'patient'})).get({plain: true});
    const eType = (await TypeDictionary.model().create({name: 'خارج شده', type: 'exit'})).get({plain: true});

    patient = (await Person.model().create({firstname: 'Test', surname: 'Patient'})).get({plain: true});
    let emr = (await EMR.model().create({person_id: patient.id, patient_type_id: pType.id})).get({plain: true});

    let document = (await Document.model().create({file_path: 'path/test', context: 'Reception'})).get({plain: true});
    let emrDoc = (await EMRDocs.model().create({emr_id: emr.id, document_id: document.id})).get({plain: true});

    // Create exited patient
    exitedPatient = (await Person.model().create({firstname: 'Exited', surname: 'Patient'})).get({plain: true});
    emr = (await EMR.model().create({person_id: exitedPatient.id, patient_type_id: pType.id, exit_date: moment('2010-10-10'), exit_type: eType.id})).get({plain: true});

    done();
  });

  it("should exit specific patient by id", async function (done) {
    try {
      this.done = done;

      const eType = (await TypeDictionary.model().create({name: 'health', type: 'exit'})).get({plain: true});

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'exitPatient',
          payload: {
            id: patient.id,
            exit_type_id: eType.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const curEMR = (await EMR.model().findOne({where: {person_id: patient.id}})).get({plain: true});

      expect(moment(curEMR.exit_date).format('YYYY-MM-DD')).toBe(moment().format('YYYY-MM-DD'));
      expect(curEMR.exit_type_id).toBe(eType.id);

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it("should get error when patient's id or exit type's id is not defined", async function (done) {
    try {
      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'exitPatient',
          payload: {
            id: patient.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Patient can be exit without defined exit type id");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when patient's id or exit type's id is not defined", async function (done) {
    try {
      const eType = (await TypeDictionary.model().create({name: 'health', type: 'exit'})).get({plain: true});

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'exitPatient',
          payload: {
            exit_type_id: eType.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Patient can be exit without defined exit type id");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when specified patient is exited", async function(done) {
    try {
      const eType = (await TypeDictionary.model().create({name: 'health', type: 'exit'})).get({plain: true});

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'exitPatient',
          payload: {
            id: exitedPatient.id,
            exit_type_id: eType.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Patient can be exit agian (For second time)");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
