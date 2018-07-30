const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const errors = require('../../../utils/errors.list');

describe("Check user validation", () => {


  beforeEach(async done => {
    await db.isReady(true);
    done();
  });

  it("admin must login with correct user name and password", async function (done) {

    try {
      this.done = done

      const result = await dbHelper.addAndLoginUser(true);
      
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'checkUserValidation'
        },
        jar: result.rpJar,
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("expect error when no cookie is sent via request", async function (done) {

    try {
      this.done = done
      const result = await dbHelper.addAndLoginUser(true);
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'checkUserValidation'
        },
        json: true,
        // jar: result.rpJar,
        resolveWithFullResponse: true
      })
      this.fail('User is valid without any cookie');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(errors.noUser.status);
      expect(err.error).toBe(errors.noUser.message);
      done();
    }
  })
 
});
