const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const env = require('../../../env');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const Role = require('../../../infrastructure/db/models/role.model');

describe('show systems roles', () => {
  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect return all roles in systems', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showSystemRoles',
          payload: {}
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      const roles = await Role.model().findAll({ raw: true });
      expect(res.body.length).toBe(roles.length);
      expect(roles[0].id).toBe(res.body[0].id);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
