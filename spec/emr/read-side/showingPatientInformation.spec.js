const rp = require('request-promise');
const moment = require('moment');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const Document = require('../../../infrastructure/db/models/document.model');
const EMRDOC = require('../../../infrastructure/db/models/emrdoc.model');
const Address = require('../../../infrastructure/db/models/address.model');

describe('Get detial of patient information', () => {
  let userId, rpJar;

  let doc_type, patient_type, exit_type, regime_type, doc, person, emr, address;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // create dictionary types
    doc_type = await TypeDictionary.model().create({ name: 'مدارک', type: 'document' });
    patient_type = await TypeDictionary.model().create({ name: 'دیالیز', type: 'patient' });
    regime_type = await TypeDictionary.model().create({ name: 'لاغری', type: 'regime' });
    exit_type = await TypeDictionary.model().create({ name: 'با کتک', type: 'exit' });
    // create document
    doc = await Document.model().create({
      file_path: 'aaa/bbb/cc.pdf',
      context: 'dms',
      user_id: userId,
      document_type_id: doc_type.id
    });
    // create person
    person = await Person.model().create({
      title: 'm',
      firstname: 'alireza',
      surname: 'ashtari',
      national_code: '1234567890',
      mobile_number: '123456789012',
      phone_number: '02177336622'
    });
    // create address
    address = await Address.model().create({ province: 'tehran', city: 'tehran', person_id: person.id });
    // create emr
    emr = await EMR.model().create({
      person_id: person.id,
      patient_type_id: patient_type.id,
      regime_type_id: regime_type.id,
      exit_type_id: exit_type.id
    });
    // create emr document
    await EMRDOC.model().create({ document_id: doc.id, emr_doc_type_id: doc_type.id, emr_id: emr.id });
    done();
  });

  it('expect error when person_id is not defined', async function(done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'EMR',
          is_command: false,
          name: 'showingPatientInformation',
          payload: {
            // person_id: person.id
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true
      });

      expect(res.statusCode).toBe(200);
      this.fail('expect error when person_id is not defined');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      expect(err.error).toBe('person_id is required');
      done();
    }
  });

  it('expect get information of this patient with person_id', async function(done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'EMR',
          is_command: false,
          name: 'showingPatientInformation',
          payload: {
            person_id: person.id
          }
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true
      });
      const _person = res.body;
      expect(res.statusCode).toBe(200);
      expect(_person.title).toBe(person.title);
      expect(_person.national_code).toBe(person.national_code);
      expect(_person.emr.person_id).toBe(person.id);
      expect(_person.emr.patientType.name).toBe(patient_type.name);
      expect(_person.addresses.length).toBe(1);
      expect(_person.addresses[0].city).toBe(address.city);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
