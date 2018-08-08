const rp = require('request-promise');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const dbHelper = require('../../../utils/db-helper');
const helper = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDoc = require('../../../infrastructure/db/models/emrdoc.model');
const Document = require('../../../infrastructure/db/models/document.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe("Upload patient's documents", () => {
  let userId, rpJar, exitedPatient, patient, dType, eType, emr;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // Add patient
    dType = await TypeDictionary.model().create({name: 'بیماران', type: 'document'});
    eType = await TypeDictionary.model().create({name: 'آزمایش HBC', type: 'patient_documents'});
    const pType = await TypeDictionary.model().create({name: 'دیالیزی', type: 'patient'});
    patient = await Person.model().create({firstname: 'بیمار', surname: 'بیمار'});
    emr = await EMR.model().create({person_id: patient.id, patient_type_id: pType.id});

    // Add exited patient
    exitedPatient = await Person.model().create({firstname: 'exited', surname: 'patient'});
    const exitType = await TypeDictionary.model().create({name: 'خارج شده', type: 'exit'});
    await EMR.model().create({person_id: exitedPatient.id, patient_type_id: pType.id, exit_type_id: exitType.id, exit_date: moment('2010-10-10')});

    done();
  });

  it("should upload patient's documents", async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'Reception',
          is_command: true,
          name: 'uploadPatientDocument',
          payload: JSON.stringify({
            doc_context: 'emr',
            patient_id: patient.id,
            emr_doc_type_id: eType.id,
            doc_type_id: dType.id,
          })
        },
        formData: {
          file: {
            value: fs.readFileSync(__dirname + path.sep + 'HIS.png'),
            options: {
              filename: 'HIS.png',
            }
          }
        },
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = JSON.parse(res.body);

      const emrDocument = (await EMRDoc.model().findOne({where: {id: res.id}})).get({plain: true});
      const document = (await Document.model().findOne({where: {id: emrDocument.document_id}})).get({plain: true});

      expect(document.document_type_id).toBe(dType.id);
      expect(document.file_path).toContain('dms/emr');
      expect(res.file_path).toContain('dms/emr');
      expect(emrDocument.emr_id).toBe(emr.id);

      done();
    } catch (err) {
      helper.errorHandler.bind(this)(err);
    }
  });

  it("should get error when data passed to upload patient's document is uncompleted", async function (done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'Reception',
          is_command: true,
          name: 'uploadPatientDocument',
          payload: JSON.stringify({
            patient_id: patient.id,
          })
        },
        formData: {
          file: {
            value: fs.readFileSync(__dirname + path.sep + 'HIS.png'),
            options: {
              filename: 'HIS.png',
            }
          }
        },
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail('Upload emr document for specific patient with incomplete passed data');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when upload document for exited patient", async function(done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'Reception',
          is_command: true,
          name: 'uploadPatientDocument',
          payload: JSON.stringify({
            doc_context: 'emr',
            patient_id: exitedPatient.id,
            emr_doc_type_id: eType.id,
            doc_type_id: dType.id,
          })
        },
        formData: {
          file: {
            value: fs.readFileSync(__dirname + path.sep + 'HIS.png'),
            options: {
              filename: 'HIS.png',
            }
          }
        },
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Can upload document for exited patient");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
