const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const TypeDic = require('../../../infrastructure/db/models/type_dictionary.model');

describe("show system type dictionaries", () => {

  let rpJar, userId;
  let types = [];

  beforeEach(async done => {
    try {
      await db.isReady(true);

      const result = await dbHelper.addAndLoginUser(true);
      userId = result.userId;
      rpJar = result.rpJar;
      types = [];
      for (let i = 0; i < 15; i++) {
        types.push({
          name: `name ${i + 1}`,
          type: `type ${Math.floor(i / 5) + 1}`
        });
      }
      await TypeDic.model().bulkCreate(types);
      done();
    }
    catch (err) {
      console.log('-> ', err);
    }
  });

  it("admin must be able to see first 10 system types without specifing any paramter ordered by name desc", async function (done) {

    try {
      this.done = done
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showSystemTypeDics',
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(types.length);
      expect(res.body.types.length).toBe(10);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("admin must be able to see next type dics with offset 10 and limit 5", async function (done) {

    try {
      this.done = done
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showSystemTypeDics',
          payload: {
            offset: 10,
            limit: 5
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(types.length);
      expect(res.body.types.length).toBe(5);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
    done();
  })
});

