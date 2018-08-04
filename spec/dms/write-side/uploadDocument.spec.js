const rp = require('request-promise');
const fs = require('fs');
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

  it('should upload a document into dms talbe', async () => {
    try {
      const type = await TypeDictionary.model().create({name: 'test', type: 'test'});

      this.done = done;
      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api/uploading`,
        headers: {
          context: 'DMS',
          is_command: true,
          name: 'uploadDocument',
          payload: {
            doc_type_id: type.id,
          },
        },
        formData: {
          value: fs.readFileSync('./HIS.png'),
          options: {
            filename: 'HIS.png',
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      const document = Document.model().findOne({where: {id: res.body.id}}).get({plain: true});

      expect(document.path).toBeDefined();
      expect(document.doc_type_id).toBe(type.id);
      expect(document.file_path).toContain('public/dms/not_categorised');
      done();

    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
