const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');

describe("Get list of patient's types", () => {
  let rpJar;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    rpJar = result.rpJar;
    done();
  });

  it("should get all patient's types", async function(done) {
    try {
      this.done = done;
      const DicTypes = [];
      let type = await TypeDictionary.model().create({name: 'Dialysis', type: 'patient'});
      DicTypes.push(type);
      type = await TypeDictionary.model().create({name: 'Common', type: 'patient'});
      DicTypes.push(type);
      type = await TypeDictionary.model().create({name: 'birth certificate', type: 'personel document'});
      DicTypes.push(type);

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showPatientTypes',
          payload: {}
        },
        json: true,
        jar: rpJar,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.count).toBe(2);
      expect(res.types.map(el => el.name)).toContain('Common');
      expect(res.types.map(el => el.name)).toContain('Dialysis');

      done();
    } catch(err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
