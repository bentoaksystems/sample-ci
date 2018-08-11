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
const Role = require('../../../infrastructure/db/models/role.model');

describe('Add policy to specific context hooks', () => {
  let ContextHooks = [
    {context: 'c1', hook: 'h1'},
    {context: 'c1', hook: 'h2'},
    {context: 'c1', hook: 'h3'},
    {context: 'c2', hook: 'h1'},
  ];

  let userId, rpJar, form;

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

    done();
  });

  it("should add policy to specific context-hook (with policy json data)", async function (done) {
    try {
      this.done = done;

      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,
            document_type_id: dType.id,
            is_required: true,
            role_ids: [role1.id, role2.id],
            policy_json: {
              a: 'answer to question a',
              b: 'answer to question b',
            }
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      const ckp = (await ContextHookPolicy.model().findOne({id: res.id})).get({plain: true});

      expect(ckp.form_id).toBeNull();
      expect(ckp.checklist_id).toBeNull();
      expect(ckp.document_type_id).toBe(dType.id);
      expect(ckp.policy_json.a).toBe('answer to question a');
      expect(ckp.policy_json.b).toBe('answer to question b');
      expect(ckp.role_ids.length).toBe(2);
      expect(ckp.role_ids).toContain(role1.id);
      expect(ckp.is_required).toBe(true);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should add policy withtout set policy json data", async function (done) {
    try {
      this.done = done;

      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,            
            document_type_id: dType.id,
            is_required: true,
            role_ids: [role1.id, role2.id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      const ckp = (await ContextHookPolicy.model().findOne({id: res.id})).get({plain: true});

      expect(ckp.form_id).toBeNull();
      expect(ckp.checklist_id).toBeNull();
      expect(ckp.document_type_id).toBe(dType.id);
      expect(ckp.role_ids.length).toBe(2);
      expect(ckp.role_ids).toContain(role1.id);
      expect(ckp.is_required).toBe(true);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get error when context_hook'id is not defined", async function (done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {            
            document_type_id: dType.id,
            is_required: true,
            role_ids: [role1.id, role2.id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added without specified context name');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when there is no context-hook with passed id", async function (done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[5],            
            document_type_id: dType.id,
            is_required: true,
            role_ids: [role1.id, role2.id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added without matched context and hook names');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when no id of check-list/form/document type passed as policy target", async function (done) {
    try {
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,            
            is_required: true,
            role_ids: [role1.id, role2.id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added without specified form/document type/checklist id');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when more than one id of check-list/form/document type pass to add policy", async function (done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const form = (await Form.model().create({name: 'patient status', user_id: userId})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      const role2 = (await Role.model().create({name: 'role2'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,
            document_type_id: dType.id,
            form_id: form.id,
            is_required: true,
            role_ids: [role1.id, role2.id],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added document_type_id and form_id');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error roles_id is an empty array", async function(done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,
            document_type_id: dType.id,
            is_required: true,
            role_ids: [],
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added with empty roles');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error roles_id is not defined", async function(done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,            
            document_type_id: dType.id,
            is_required: true,
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added without defined roles list');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });

  it("should get error when add policy again", async function (done) {
    try {
      const dType = (await TypeDictionary.model().create({name: 'lab result', type: 'document'})).get({plain: true});
      const role1 = (await Role.model().create({name: 'role1'})).get({plain: true});
      await ContextHookPolicy.model().create({is_required: true, document_type_id: dType.id, context_hook_id: ContextHooks[0].id, role_ids: [role1.id]});

      let result = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Sys',
          name: 'addPolicy',
          is_command: true,
          payload: {
            id: ContextHooks[0].id,
            document_type_id: dType.id,
            is_required: true,
          }
        },
        jar: rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('Context-Hook-Policy was added again (policy for this target and context-hook is defined before)');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});