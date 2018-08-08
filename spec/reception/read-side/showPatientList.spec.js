const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Get list of all patient', () => {
  let userId, rpJar;
  let patientTypes = [];
  let exitTypes = [];

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    patientTypes = [];
    exitTypes = [];

    patientTypes.push((await TypeDictionary.model().create({name: 'دیالیزی', type: 'patient'})).get({plain: true}));
    patientTypes.push((await TypeDictionary.model().create({name: 'عمومی', type: 'patient'})).get({plain: true}));

    // Add few patients to database
    let PatientList = [
      {
        firstname: 'Ali',
        surname: 'Alavi',
        national_code: '0011',
        mobile_number: '09121',
        phone_number: '021851',
      },
      {
        firstname: 'Taghi',
        surname: 'Taghavi',
        national_code: '0012',
        mobile_number: '09122',
        phone_number: '021852',
      },
      {
        firstname: 'Naghi',
        surname: 'Naghavi',
        national_code: '0013',
        mobile_number: '09123',
        phone_number: '021853',
      },
      {
        firstname: 'Ali',
        surname: 'Amiri',
        national_code: '0014',
        mobile_number: '09124',
        phone_number: '021854',
      },
    ];

    for (let index = 0; index < PatientList.length; index++) {
      PatientList[index] = (await Person.model().create(PatientList[index])).get({plain: true});
    }

    exitTypes.push((await TypeDictionary.model().create({name: 'بهبودی', type: 'patient_exit'})).get({plain: true}));

    const EMRList = [
      {
        person_id: PatientList[0].id,
        patient_type_id: patientTypes[0].id,
        entry_date: moment('2008-08-08'),
      },
      {
        person_id: PatientList[1].id,
        patient_type_id: patientTypes[0].id,
        entry_date: moment('2009-09-09'),
      },
      {
        person_id: PatientList[2].id,
        patient_type_id: patientTypes[0].id,
        entry_date: moment('2010-10-10'),
        exit_date: moment('2011-11-11'),
        exit_type_id: exitTypes[0].id,
      },
      {
        person_id: PatientList[3].id,
        patient_type_id: patientTypes[1].id,
        entry_date: moment('2012-12-12'),
      }
    ];

    for (let index = 0; index < EMRList.length; index++) {
      await EMR.model().create(EMRList[index]);
    }

    done();
  });

  it('should get list of all patient', async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientList',
          payload: {
            name: '',
            phone_number: null,
            mobile_number: '',
            patient_type_id: null,
            is_exited: null,
            offset: 0,
            limit: 10,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.patients.length).toBe(4);
      expect(res.count).toBe(4);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it('should get filtered patients', async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientList',
          payload: {
            name: ' li a  ',
            phone_number: '',
            mobile_number: '',
            patient_type_id: patientTypes[1].id,
            is_exited: false,
            offset: 0,
            limit: 10,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.patients.length).toBe(1);
      expect(res.count).toBe(1);
      expect(res.patients[0].firstname).toBe('Ali');
      expect(res.patients[0].surname).toBe('Amiri');
      expect(res.patients[0].emr.patient_type_id).toBe(patientTypes[1].id);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it('should get exited patients', async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientList',
          payload: {
            name: null,
            phone_number: '',
            mobile_number: '',
            patient_type_id: null,
            is_exited: true,
            offset: 0,
            limit: 10,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.patients.length).toBe(1);
      expect(res.count).toBe(1);
      expect(res.patients[0].firstname).toBe('Naghi');
      expect(res.patients[0].surname).toBe('Naghavi');
      expect(res.patients[0].emr.patient_type_id).toBe(patientTypes[0].id);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it('should get patient based on national_code', async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientList',
          payload: {
            phone_number: '',
            national_code: '  12 ',
            patient_type_id: null,
            is_exited: null,
            offset: 0,
            limit: 10,
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.patients.length).toBe(1);
      expect(res.count).toBe(1);
      expect(res.patients[0].firstname).toBe('Taghi');
      expect(res.patients[0].surname).toBe('Taghavi');
      expect(res.patients[0].emr.patient_type_id).toBe(patientTypes[0].id);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get list of patient based on default offset and limit (did not passed to fetch list)", async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientList',
          payload: {}
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.patients.length).toBe(4);
      expect(res.count).toBe(4);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
