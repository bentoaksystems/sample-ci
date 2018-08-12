const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const env = require('../../../env');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const Action = require('../../../infrastructure/db/models/action.model');
const Role = require('../../../infrastructure/db/models/role.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');

describe('show systems actions', () => {
  const actionsArr = [
    { name: 'A', context: 'CapitalLetters' },
    { name: 'B', context: 'CapitalLetters' },
    { name: 'C', context: 'CapitalLetters' },
    { name: 'a', context: 'LowercaseLetter' },
    { name: 'b', context: 'LowercaseLetter' },
    { name: 'c', context: 'LowercaseLetter' }
  ];

  let rpJar, userId, _role;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    // create role
    _role = await Role.model().create({ name: 'Hr' });
    // create actions
    const _actions = await Action.model().bulkCreate(actionsArr);
    // create array need role_action
    const role_actions = [
      { role_id: _role.id, action_id: _actions[0].id },
      { role_id: _role.id, action_id: _actions[1].id }
    ];
    // create role_action
    await RoleAction.model().bulkCreate(role_actions);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect return all actions for this role', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showRoleAccecibleActions',
          payload: {
            role_id: _role.id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(_role.id);
      expect(res.body.role_actions.length).toBe(2);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
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
          is_command: false,
          name: 'showRoleAccecibleActions',
          payload: {
            // role_id: ''
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
});
