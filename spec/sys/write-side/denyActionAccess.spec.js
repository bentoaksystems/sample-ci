const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const helpers = require('../../../utils/helpers');
const dbHelper = require('../../../utils/db-helper');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');
const Action = require('../../../infrastructure/db/models/action.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');

describe('deny Action Access of Role', () => {
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
    // create role
    actions = await Action.model().bulkCreate(actionsArr);
    // create role _actions
    const role_actions = [{ role_id: role.id, access: '/hr/read/*' }];
    actions.forEach(action => {
      role_actions.push({ role_id: role.id, action_id: action.id });
    });
    await RoleAction.model().bulkCreate(role_actions);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect delete action ids from this role', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'denyActionAccess',
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
      const _role_actions = await RoleAction.model().findAll();
      expect(_role_actions.length).toBe(5);
      done();
    } catch (error) {
      helpers.errorHandler.bind(this)(error);
    }
  });

  it('expect delete action access from this role', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: true,
          name: 'denyActionAccess',
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
      const _role_actions = await RoleAction.model().find({ where: { role_id: role.id, access: '/hr/read/*' } });
      expect(_role_actions).toBe(null);
      done();
    } catch (error) {
      helpers.errorHandler.bind(this)(error);
    }
  });
});
