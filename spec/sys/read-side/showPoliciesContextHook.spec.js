const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const env = require('../../../env');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const Form = require('../../../infrastructure/db/models/form.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const Role = require('../../../infrastructure/db/models/role.model');

describe('Get c', () => {
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

  const roleArr = [{ name: 'role0' }, { name: 'role1' }, { name: 'role2' }, { name: 'role3' }];

  let rpJar, userId, contextHooks, roles;
  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);
    // create Forms
    const _formContext = await Form.model().create({ name: 'form in context Hook', user_id: result.userId });
    const _formPolicy = await Form.model().create({ name: 'form in policy context hooks', user_id: result.userId });
    const _typeDictionaryDocument = await TypeDictionary.model().create({
      name: 'document in policy context hooks',
      type: 'document'
    });
    // create context hooks
    contextHookArr = contextHookArr.map(element => {
      element['form_id'] = _formContext.id;
      return element;
    });
    contextHooks = await ContextHook.model().bulkCreate(contextHookArr);
    // create roles
    roles = await Role.model().bulkCreate(roleArr);
    // create poicy contexts-hook
    const ContextHookPolicyArr = [
      {
        role_ids: [roles[0].id, roles[1].id],
        is_required: true,
        policy_json: { name: '', surname: '', age: '' },
        context_hook_id: contextHooks[0].id,
        form_id: _formPolicy.id
      },
      {
        role_ids: [roles[2].id, roles[3].id],
        is_required: true,
        policy_json: { doc_name: '', doc_type: '', doc_size: '' },
        context_hook_id: contextHooks[1].id,
        document_type_id: _typeDictionaryDocument.id
      }
    ];
    await ContextHookPolicy.model().bulkCreate(ContextHookPolicyArr);

    userId = result.userId;
    rpJar = result.rpJar;
    done();
  });

  it('expect error when context_hook_id is undefined', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showPoliciesContextHook',
          payload: {
            // context_hook_id: contextHooks[0].id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      this.fail('expect error when context_hook_id is undefined');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      expect(err.error).toBe('context_hook_id is required');
      done();
    }
  });

  it('expect show systems policies of context-hook', async function(done) {
    try {
      this.done = done;
      const res = await rp({
        method: 'POST',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          is_command: false,
          name: 'showPoliciesContextHook',
          payload: {
            context_hook_id: contextHooks[0].id
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true
      });
      expect(res.statusCode).toBe(200);
      const objectBack = res.body;
      expect(objectBack.length).toBe(1);
      expect(objectBack[0].role_ids.length).toBe(2);
      expect(objectBack[0].role_ids).toMatch([roles[0].id, roles[1].id]);
      expect(objectBack[0].context_hook_id).toBe(contextHooks[0].id);
      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });
});
