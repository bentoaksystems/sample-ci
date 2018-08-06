const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Document = require('../../../infrastructure/db/models/document.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Remove exist document', () => {
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

  it("should remove exist document", async function (done) {
    try {
      this.done = done;

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'DMS',
          is_command: true,
          name: 'removeDocument',
          payload: {
            id: document.id,
          },
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const doc = (await Document.model().findOne({where: {id: document.id}}));

      expect(doc).toBeNull();

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get error when current document's id is not defined", async function (done) {
    try {
      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'DMS',
          is_command: true,
          name: 'removeDocument',
          payload: {},
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      this.fail("Remove document withoud passing its id");
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
