const db = require('../../../infrastructure/db');
const rp = require('request-promise');
const helpers = require('../../../utils/helpers');
const dbHelper = require('../../../utils/db-helper');
const env = require('../../../env');
const FormField = require('../../../infrastructure/db/models/form_field.model');
const Form = require('../../../infrastructure/db/models/form.model');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const Checklist = require('../../../infrastructure/db/models/checklist.model');
const Role = require('../../../infrastructure/db/models/role.model');

describe('Correct exist policy details', () => {
  let ContextHooks = [
    {context: 'c1', hook: 'h1'},
    {context: 'c1', hook: 'h2'},
  ];

  let userId, rpJar, form, roles, contextHookPolicy;

  beforeEach(async done => {
    await db.isReady(true);
    const result = await dbHelper.addAndLoginUser(true);

    userId = result.userId;
    rpJar = result.rpJar;

    // Add Form
    form = (await Form.model().create({name: 'policy form', user_id: userId})).get({plain: true});

    const formFields = [];
    formFields.push((await FormField.model().create({hashKey: 'a', title: 'question 1', answerShowType: 'dropdown', fieldPriority: 1, form_id: form.id})).get({plain: true}));
    formFields.push((await FormField.model().create({hashKey: 'b', title: 'question 2', answerShowType: 'select', fieldPriority: 2, form_id: form.id})).get({plain: true}));
    formFields.push((await FormField.model().create({hashKey: 'c', title: 'question 3', answerShowType: 'checkbox', fieldPriority: 3, form_id: form.id})).get({plain: true}));

    for (let index = 0; index < ContextHooks.length; index++) {
      ContextHooks[index] = (await ContextHook.model().create(Object.assign(ContextHooks[index], {form_id: form.id}))).get({plain: true});
    }

    // Add some Roles
    roles = [];
    roles.push((await Role.model().create({name: 'role 1'})).get({plain: true}));
    roles.push((await Role.model().create({name: 'role 2'})).get({plain: true}));

    // Add doucment Type id
    const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});

    // Add Context-Hook policies
    contextHookPolicy = (await ContextHookPolicy.model().create({
      context_hook_id: ContextHooks[0].id,
      is_required: true,
      document_type_id: dType.id,
      role_ids: roles.map(el => el.id),
      policy_json: {
        a: '1',
        b: '2',
      },
    })).get({plain: true});

    done();
  });

  it("should update is_required part of policy", async function(done) {
    try {
      this.done = done;

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'correctPolicy',
          is_command: true,
          payload: {
            id: contextHookPolicy.id,
            is_required: false,
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);
      
      const chp = (await ContextHookPolicy.model().findOne({where: {id: contextHookPolicy.id}})).get({plain: true});

      expect(chp.is_required).toBe(false);

      done();
    } catch(err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should change role access (ids)", async function(done) {
    try {
      this.done = done;

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'correctPolicy',
          is_command: true,
          payload: {
            id: contextHookPolicy.id,
            role_ids: [roles[0].id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);
      
      const chp = (await ContextHookPolicy.model().findOne({where: {id: contextHookPolicy.id}})).get({plain: true});

      expect(chp.role_ids.length).toBe(1);
      expect(chp.role_ids[0]).toBe(roles[0].id);

      done();
    } catch(err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should change policJson data and target type", async function(done) {
    try {
      this.done = done;

      const checklist = (await Checklist.model().create({name: 'cl'})).get({plain: true});

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'correctPolicy',
          is_command: true,
          payload: {
            id: contextHookPolicy.id,
            checklist_id: checklist.id,
            policy_json: {
              b: '1',
              c: '2',
            }
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);
      
      const chp = (await ContextHookPolicy.model().findOne({where: {id: contextHookPolicy.id}})).get({plain: true});

      expect(chp.document_type_id).toBeNull();
      expect(chp.checklist_id).toBe(checklist.id);
      expect(Object.keys(chp.policy_json).length).toBe(2);
      expect(Object.keys(chp.policy_json)).toContain('b');
      expect(Object.keys(chp.policy_json)).toContain('c');

      done();
    } catch(err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get error context_hook_policy'id is not passed", async function(done) {
    try {
      this.done = done;

      const checklist = (await Checklist.model().create({name: 'cl'})).get({plain: true});

      const res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'correctPolicy',
          is_command: true,
          payload: {
            checklist_id: checklist.id,
            policy_json: {
              b: '1',
              c: '2',
            }
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy has updated without specified id');
      done();
    } catch(err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});