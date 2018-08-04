const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Document = require('../../../infrastructure/db/models/document.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Update exist document', () => {
  let rpJar, userId, document;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;

    // Add document
    const type = (await TypeDictionary.model().create({name: 'test', type: 'test'})).get({plain: true});
    document = (await Document.model().create({document_type_id: type.id, file_path: 'a/b/c', context: 'x'})).get({plain: true});

    done();
  });

  it("should update exist document by id", async function (done) {
    try {
      this.done = done;

      const type = (await TypeDictionary.model().create({name: 'nt', type: 'nt'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'DMS',
          is_command: true,
          name: 'updateDocument',
          payload: JSON.stringify({
            id: document.id,
            doc_type_id: type.id,
          }),
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

      res = res ? JSON.parse(res.body) : null;
      const newDocument = (await Document.model().findOne({where: {id: res.document_id}})).get({plain: true});

      expect(newDocument.document_type_id).toBe(type.id);
      expect(newDocument.file_path).toContain('dms/not_categorised');
      expect(res.file_path).toContain('dms/not_categorised');
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get error when current document's id is not defined", async function (done) {
    try {
      const type = (await TypeDictionary.model().create({name: 'nt', type: 'nt'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'DMS',
          is_command: true,
          name: 'updateDocument',
          payload: JSON.stringify({
            doc_type_id: type.id,
          }),
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

      this.fail("Can update document without specifiying the document's id ");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  xit("should get error when new document details is not defined", async function (done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'DMS',
          is_command: true,
          name: 'updateDocument',
          payload: JSON.stringify({
            id: document.id,
          }),
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

      this.fail("Can update document without specifiying the document's type id");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
