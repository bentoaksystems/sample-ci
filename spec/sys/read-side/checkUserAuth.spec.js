const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');

describe("Check user authentication", () => {

  beforeEach(done => {

    db.isReady(true)
      .then(res => {
        return dbHelper.addAdmin()
      })
      .then(res => {
        done();
      })
  });

  it("admin must login with correct user name and password", function (done) {

    this.done = done;
    rp({
      method: 'POST',
      uri: `${env.appAddress}/api/login`,
      body: {
        username: 'admin',
        password: 'admin@123'
      },
      json: true,
      resolveWithFullResponse: true
    }).then(res => {
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('admin');
      expect(res.body.firstname).toBe('Admin');
      expect(res.body.surname).toBe('Admin');
      expect(res.body.accessed_routes).not.toBeNull();
      expect(res.body.accessed_routes.length).toBe(1);
      expect(res.body.accessed_routes[0]).toBe('_all_');
      done();
    }).catch(helpers.errorHandler.bind(this));
  })

  it("test user must login with correct user name and password", function (done) {

    this.done = done;

    let role_id;
    dbHelper.addUser()
      .then(res => {
        role_id = res.role.id;
        return dbHelper.addPage()
      })
      .then(res => {
        return dbHelper.assignPageToRole(role_id, res.id)
      })
      .then(res => {
        return rp({
          method: 'POST',
          uri: `${env.appAddress}/api/login`,
          body: {
            username: 'test_user',
            password: '123456'
          },
          json: true,
          resolveWithFullResponse: true
        })
      })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body.username).toBe('test_user');
        expect(res.body.firstname).toBe('test firstname');
        expect(res.body.surname).toBe('test surname');
        expect(res.body.accessed_routes).not.toBeNull();
        expect(res.body.accessed_routes.length).toBe(1);
        expect(res.body.accessed_routes[0]).toBe('/test');
        done();
      }).catch(helpers.errorHandler.bind(this));
  })

  it("expect error on wrong password", function (done) {

    this.done = done;
    rp({
      method: 'POST',
      uri: `${env.appAddress}/api/login`,
      body: {
        username: 'admin',
        password: 'admin@1234' // wrong password
      },
      json: true,
      resolveWithFullResponse: true
    }).then(res => {
      this.fail('User can login with wrong password');
      done();
    }).catch(err => {
      expect(err.statusCode).toBe(401);
      done();
    });
  })

});
