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
      console.log('-> ', res);
      expect(res.statusCode).toBe(200);
      done();
    }).catch(helpers.errorHandler.bind(this));
  })

});
