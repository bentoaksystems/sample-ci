const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const helpers = require('../../../utils/helpers');
const dbHelper = require('../../../utils/db-helper');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');
const Action = require('../../../infrastructure/db/models/action.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');

describe('grant Action Access of Role:', () => {
  const actionsArr = [
    { name: 'A', context: 'CapitalLetters' },
    { name: 'B', context: 'CapitalLetters' },
    { name: 'C', context: 'CapitalLetters' },
    { name: 'a', context: 'LowercaseLetter' },
    { name: 'b', context: 'LowercaseLetter' },
    { name: 'c', context: 'LowercaseLetter' }
  ];
  let userId, rpJar, role, actions;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    // create role
    role = await Role.model().create({ name: 'Hr' });
    // create action
    actions = await Action.model().bulkCreate(actionsArr);
    await RoleAction.model().create({ role_id: role.id, access: '/sys/read/*' });
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect add action ids from this role', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantActionAcess',
          payload: {
            role_id: role.id,
            actionIds: [actions[0].id, actions[1].id]
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      // const _role_actions = await RoleAction.model().findAll({ where: { role_id: role.id }, raw: true });
      // expect(_role_actions.length).toBe(2)

      done();
    } catch (error) {
      helpers.errorHandler.bind(this)(error);
    }
  });

  it('expect add action access from this role', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantActionAcess',
          payload: {
            role_id: role.id,
            access: '/hr/read/*'
            // actionIds: [actions[0].id, actions[1].id]
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      const _role_actions = await RoleAction.model().find({ where: { role_id: role.id, access: '/hr/read/*' }, raw: true });
      expect(_role_actions.role_id).toBe(role.id);
      expect(_role_actions.access).toBe('/hr/read/*');
      done();
    } catch (error) {
      helpers.errorHandler.bind(this)(error);
    }
  });

  it('expect error when role_id is not defined', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantActionAcess',
          payload: {
            // role_id: role.id,
            actionIds: [actions[0].id, actions[1].id]
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      this.fail('expect error when role_id is not defined');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it('expect error when access is duplicate', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'grantActionAcess',
          payload: {
            role_id: role.id,
            access: '/sys/read/*'
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      this.fail('expect error when access is duplicate');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});
