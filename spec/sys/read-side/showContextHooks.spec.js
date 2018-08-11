const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const env = require('../../../env');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const Form = require('../../../infrastructure/db/models/form.model');

describe('Get Context Hooks', () => {
  let contextHookArr = [
    { context: 'context1', hook: 'hook1' },
    { context: 'context1', hook: 'hook2' },
    { context: 'context1', hook: 'hook3' },
    { context: 'context1', hook: 'hook4' },
    { context: 'context2', hook: 'hook1' },
    { context: 'context2', hook: 'hook2' },
    { context: 'context2', hook: 'hook3' },
    { context: 'context2', hook: 'hook4' },
    { context: 'context3', hook: 'hook1' }
  ];

  let rpJar, userId;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    // create Forms
    const _form = await Form.model().create({ name: 'form1', user_id: result.userId });
    // create context hooks
    contextHookArr = contextHookArr.map(element => {
      element['form_id'] = _form.id;
      return element;
    });
    await ContextHook.model().bulkCreate(contextHookArr);
    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect show systems hooks of context', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showContextHooks',
          payload: {}
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].hooks.length).toBe(4);
      expect(res.body[0].context).toBe('context1');
      expect(res.body[1].hooks.length).toBe(4);
      expect(res.body[1].context).toBe('context2');
      expect(res.body[2].hooks.length).toBe(1);
      expect(res.body[2].context).toBe('context3');
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
