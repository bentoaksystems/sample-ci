const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');

describe("Check user validation", () => {

  let userId, rpJar;

  beforeEach(async done => {
    await db.isReady(true);
    done();
  });

  it("admin must login with correct user name and password", async function (done) {

    try {
      this.done = done

      const result = await dbHelper.addAndLoginUser(true);
      userId = result.userId;
      rpJar = result.rpJar;

      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api/login`,
        body: {
          username: 'admin',
          password: '123456'
        },
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('admin');
      expect(res.body.firstname).toBe('Admin');
      expect(res.body.surname).toBe('Admin');
      expect(res.body.accessed_routes).not.toBeNull();
      expect(res.body.accessed_routes.length).toBe(1);
      expect(res.body.accessed_routes[0]).toBe('_all_');
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("test user must login with correct user name and password", async function (done) {
    try {
      this.done = done;
      const user = await dbHelper.addUser();
      const page = await dbHelper.addPage();
      await dbHelper.assignPageToRole(user.role.id, page.id);
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api/login`,
        body: {
          username: 'test_user',
          password: '123456'
        },
        json: true,
        resolveWithFullResponse: true
      })
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('test_user');
      expect(res.body.firstname).toBe('test firstname');
      expect(res.body.surname).toBe('test surname');
      expect(res.body.accessed_routes).not.toBeNull();
      expect(res.body.accessed_routes.length).toBe(1);
      expect(res.body.accessed_routes[0]).toBe('/test');
      done();
    }
    catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  })

  it("expect error on wrong password", async function (done) {

    try {
      this.done = done;
      await rp({
        method: 'POST',
        uri: `${env.appAddress}/api/login`,
        body: {
          username: 'admin',
          password: 'admin@1234' // wrong password
        },
        json: true,
        resolveWithFullResponse: true
      });
      this.fail('User can login with wrong password');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(401);
      done();
    }
  })

});
