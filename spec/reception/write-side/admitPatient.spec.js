const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helper = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const Address = require('../../../infrastructure/db/models/address.model');

describe('Admit patient in reception', () => {
  let userId, rpJar;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.id;
    rpJar = result.rpJar;
    done();
  });

  it('One with reception access should admit new dialysis patient (both age and birth date are defined)', async function (done) {
    try {
      this.done = done;

      const dialysisType = await TypeDictionary.model().create({name: 'patient_type', type: 'dialysis'});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'admitPatient',
          payload: {
            firstname: 'Ali',
            surname: 'Alavi',
            title: 'm',
            national_code: '1234567890',
            mobile_number: '9092301202',
            phone_number: '9092301202',
            patient_type_id: dialysisType.id,
            birth_date: moment('1993-03-02'),
            age: 25,
            address: {
              province: 'Tehran',
              city: 'Tehran',
              district: 3,
            }
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);
      res = res.body;

      let person = await Person.model().findOne({where: {id: res.id}});
      let emr = await EMR.model().findOne({where: {person_id: person.id}});
      let address = await Address.model().findOne({where: {person_id: person.id}});

      expect(person).toBeDefined();
      expect(moment(person.birth_date).format('YYYY-MM-DD')).toBe('1993-03-02');
      expect(person.age).toBe(25);
      expect(emr).toBeDefined();
      expect(emr.exit_date).toBeNull();
      expect(moment(emr.entry_date).format('YYYY-MM-DD')).toBe(moment().format('YYYY-MM-DD'));
      expect(emr.patient_type_id).toBe(dialysisType.id);
      expect(address.province).toBe('Tehran');
      expect(address.city).toBe('Tehran');
      expect(address.district).toBe(3);

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it('One with reception access should admit new dialysis patient (only age is defined)', async function (done) {
    try {
      this.done = done;

      const dialysisType = await TypeDictionary.model().create({name: 'patient_type', type: 'dialysis'});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'admitPatient',
          payload: {
            firstname: 'Ali',
            surname: 'Alavi',
            title: 'm',
            national_code: '1234567890',
            mobile_number: '9092301202',
            phone_number: '9092301202',
            patient_type_id: dialysisType.id,
            age: 25,
            address: {
              province: 'Tehran',
              city: 'Tehran',
              district: 3,
            }
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);
      res = res.body;

      let person = await Person.model().findOne({where: {id: res.id}});
      let emr = await EMR.model().findOne({where: {person_id: person.id}});

      expect(person).toBeDefined();
      expect(person.birth_date).toBeNull();
      expect(person.age).toBe(25);
      expect(emr).toBeDefined();
      expect(emr.exit_date).toBeNull();
      expect(moment(emr.entry_date).format('YYYY-MM-DD')).toBe(moment().format('YYYY-MM-DD'));
      expect(emr.patient_type_id).toBe(dialysisType.id);

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it('should get error when passed data is not complete', async function (done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: true,
          name: 'admitPatient',
          payload: {
            firstname: 'Ali',
            surname: 'Alavi',
            title: 'm',
            national_code: '1234567890',
            mobile_number: '9092301202',
            phone_number: '9092301202',
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Incomplete data for admitting pataient is accepted');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      // expect(err.error).toBe('incomplete payload for adding a new patient');
      done();
    }
  });
})