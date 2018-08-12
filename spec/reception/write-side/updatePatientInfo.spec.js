const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helper = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');

describe("Update patient's information", () => {
  let userId, rpJar, patient, exitedPatient;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // Add patient
    patient = {};
    patient = (await Person.model().create({firstname: 'test', surname: 'patient'})).get({plain: true});
    const pType = (await TypeDictionary.model().create({name: 'دیالیزی', type: 'patient'})).get({plain: true});
    patient.emr = (await EMR.model().create({
      person_id: patient.id,
      patient_type_id: pType.id,
      entry_date: moment('2010-10-10').format('YYYY-MM-DD'),
    })).get({plain: true});

    // Add exited patient
    exitedPatient = (await Person.model().create({firstname: 'exited', surname: 'patient'})).get({plain: true});
    const eType = (await TypeDictionary.model().create({name: 'خارج شده', type: 'exit'}));
    await EMR.model().create({person_id: exitedPatient.id, patient_type_id: pType.id, exit_type_id: eType.id, exit_date: moment('2010-10-10')});

    done();
  });

  it("should update exist patient's information (ignore changing entry_date)", async function (done) {
    try {
      this.done = done;

      const pType = (await TypeDictionary.model().create({name: 'بیماری جدید', type: 'patient'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'updatePatientInfo',
          payload: {
            id: patient.id,
            firstname: 'no matter',
            title: 'm',
            patient_type_id: pType.id,
            entry_date: moment().format('YYYY-MM-DD'),
          },
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const newPatient = (await Person.model().findOne({where: {id: patient.id}})).get({plain: true});
      newPatient.emr = (await EMR.model().findOne({where: {person_id: patient.id}})).get({plain: true});

      expect(newPatient.firstname).toBe('no matter');
      expect(newPatient.title).toBe('m');
      expect(newPatient.emr.patient_type_id).toBe(pType.id);
      expect(moment(newPatient.emr.entry_date).format('YYYY-MM-DD')).toBe(moment('2010-10-10').format('YYYY-MM-DD'));

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it("should ignore to change when no changed field passed to server", async function (done) {
    try {
      this.done = done;

      const pType = (await TypeDictionary.model().create({name: 'بیماری جدید', type: 'patient'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'updatePatientInfo',
          payload: {
            id: patient.id,
          },
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const newPatient = (await Person.model().findOne({where: {id: patient.id}})).get({plain: true});
      newPatient.emr = (await EMR.model().findOne({where: {person_id: patient.id}})).get({plain: true});

      expect(newPatient.firstname).toBe(patient.firstname);
      expect(newPatient.title).toBe(patient.title);
      expect(newPatient.emr.patient_type_id).toBe(patient.emr.patient_type_id);
      expect(moment(newPatient.emr.entry_date).format('YYYY-MM-DD')).toBe(moment(patient.emr.entry_date).format('YYYY-MM-DD'));

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it("should get error when patient's id not passed", async function (done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'updatePatientInfo',
          payload: {},
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Update without patient's id");

      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when updating exited patient", async function(done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'updatePatientInfo',
          payload: {
            id: exitedPatient.id,
            firstname: 'no matter',
            title: 'm',
          },
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Exited patient is updated");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
