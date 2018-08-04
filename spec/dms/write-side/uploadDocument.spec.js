const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Document = require('../../../infrastructure/db/models/document.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe('Uploading a document', () => {
  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true, 'admin');
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('should upload a document into dms table', async function (done) {
    try {
      const type = await TypeDictionary.model().create({name: 'test', type: 'test'});

      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'DMS',
          is_command: true,
          name: 'uploadDocument',
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

      expect(res.statusCode).toBe(200);
      
      res = JSON.parse(res.body);
      const document = (await Document.model().findOne({where: {id: res.id}})).get({plain: true});

      expect(document.document_type_id).toBe(type.id);
      expect(document.file_path).toContain('dms/not_categorised');
      expect(res.file_path).toContain('dms/not_categorised');
      done();

    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
