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

describe('Remove patient', () => {
  let userId, rpJar, patient, emr, emrDoc, document, exitedPatient;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // Add patient
    const pType = (await TypeDictionary.model().create({name: 'دیالیزی', type: 'patient'})).get({plain: true});

    patient = (await Person.model().create({firstname: 'Test', surname: 'Patient'})).get({plain: true});
    emr = (await EMR.model().create({person_id: patient.id, patient_type_id: pType.id})).get({plain: true});

    document = (await Document.model().create({file_path: 'path/test', context: 'Reception'})).get({plain: true});
    emrDoc = (await EMRDocs.model().create({emr_id: emr.id, document_id: document.id})).get({plain: true});

    // Add exited patient
    const eType = (await TypeDictionary.model().create({name: 'خارج شده', type: 'exit'})).get({plain: true});
    exitedPatient = (await Person.model().create({firstname: 'Exited', surname: 'Patient'})).get({plain: true});
    await EMR.model().create({person_id: exitedPatient.id, patient_type_id: pType.id, exit_type_id: eType.id, exit_date: moment('2010-10-10')});

    done();
  });

  it("should remove patient with specific id", async function (done) {
    try {
      this.done = done;

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'removePatient',
          payload: {
            id: patient.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const curPatient = await Person.model().findOne({where: {id: patient.id}});
      const curEMR = await EMR.model().findOne({where: {id: emr.id}});
      const curEMRDoc = await EMRDocs.model().findOne({where: {id: emrDoc.id}});
      const curDoc = await Document.model().findOne({where: {id: document.id}});

      expect(curPatient).toBeNull();
      expect(curEMR).toBeNull();
      expect(curEMRDoc).toBeNull();
      expect(curDoc).toBeNull();

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it("should get error when patient's id is not passed", async function (done) {
    try {
      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'removePatient',
          payload: {}
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail('Remove patient without specific id');

      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when removing exited patient", async function (done) {
    try {
      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'removePatient',
          payload: {
            id: exitedPatient.id,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Exited patient can removed from database");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
