const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helper = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Admit patient in reception', () => {
  let userId, rpJar;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.id;
    rpJar = result.rpJar;
    done();
  });

  it('One with reception access should admit new dialysis patient', async function (done) {
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
      expect(emr).toBeDefined();
      expect(emr.exit_date).toBeNull();
      expect(moment(emr.entry_date).format('YYYY-MM-DD')).toBe(moment().format('YYYY-MM-DD'));
      expect(emr.patient_type_id).toBe(dialysisType.id);

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it('should get error when passed data is not complete', async function(done) {
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
    } catch(err) {
      expect(err.statusCode).toBe(500);
      // expect(err.error).toBe('incomplete payload for adding a new patient');
      done();
    }
  });
})