const rp = require('request-promise');
const dbHelper = require('../../../utils/db-helper');
const helpers = require('../../../utils/helpers');
const db = require('../../../infrastructure/db');
const env = require('../../../env');
const Role = require('../../../infrastructure/db/models/role.model');
const ContextHook = require('../../../infrastructure/db/models/context_hook.model');
const ContextHookPolicy = require('../../../infrastructure/db/models/context_hook_policy.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const FormField = require('../../../infrastructure/db/models/form_field.model');
const Form = require('../../../infrastructure/db/models/form.model');
const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDoc = require('../../../infrastructure/db/models/emrdoc.model');
const Document = require('../../../infrastructure/db/models/document.model');
const Action = require('../../../infrastructure/db/models/action.model');

describe("Show admission policies", () => {
  let
    adminUser,
    regularUser,
    contextHookPolicies,
    documentType,
    form,
    document,
    patientId;

  beforeEach(async done => {
    await db.isReady(true);

    // Add two user with different role access
    let result = await dbHelper.addAndLoginUser(true);
    adminUser = {
      rpJar: result.rpJar,
      userId: result.userId,
    };
    result = await dbHelper.addAndLoginUser(false, 'ru', '123465', [{name: 'modify_patient'}]);
    regularUser = {
      rpJar: result.rpJar,
      userId: result.userId,
    };

    const admitRole = (await Role.model().create({name: 'admit_patient'})).get({plain: true});
    const modifyRole = (await Role.model().findOne({where: {name: 'modify_patient'}})).get({plain: true});

    const action = (await Action.model().create({context: 'Reception', name: 'showAdmissionPolicies'})).get({plain: true});
    await dbHelper.assignActionToRole(modifyRole.id, action.id);

    // Add document type
    documentType = (await TypeDictionary.model().create({name: 'lab result', type: 'patient_doc'})).get({plain: true});

    // Add form
    form = (await Form.model().create({name: 'patient_status'})).get({plain: true});
    await FormField.model().create({hashKey: 'a', title: 'What was patient status in admission time?', answerShowType: 'check_box', fieldPriority: 1});


    // Create some context-hook and context-hook-policy items
    const ch = (await ContextHook.model().create({context: 'Reception', hook: 'admission'})).get({plain: true});
    const chpList = [
      {
        context_hook_id: ch.id,
        role_ids: [admitRole.id],
        is_required: true,
        document_type_id: documentType.id,
        policy_json: {
          a: 1
        }
      },
      {
        context_hook_id: ch.id,
        role_ids: [admitRole.id, modifyRole.id],
        is_required: true,
        form_id: form.id,
      }
    ];

    contextHookPolicies = [];

    for (let index = 0; index < chpList.length; index++)
      contextHookPolicies.push((await ContextHookPolicy.model().create(chpList[index])).get({plain: true}));

    // Add patient
    patientId = (await Person.model().create({firstname: 'patient', surname: 'patient'})).get({plain: true}).id;
    const emr = (await EMR.model().create({person_id: patientId})).get({plain: true});
    document = (await Document.model().create({document_type_id: documentType.id, file_path: 'x/y/z', context: 'Reception'})).get({plain: true});
    const emrDoc = (await EMRDoc.model().create({emr_id: emr.id, document_id: document.id}));

    done();
  });

  it("should get policies for specific hook", async function (done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showAdmissionPolicies',
          payload: {
            patient_id: patientId,
          }
        },
        jar: adminUser.rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;
      
      console.log('res.document_types[0]: ', res.document_types[0]);

      expect(res.document_types.length).toBe(1);
      expect(res.forms.length).toBe(1);
      expect(res.checklists.length).toBe(0);
      expect(res.document_types[0].is_uploaded).toBe(true);
      expect(res.document_types[0].is_required).toBe(true);
      expect(res.document_types[0].policy_json.a).toBe(1);
      expect(res.document_types[0].file_path).toBe('x/y/z');
      expect(res.document_types[0].document_id).toBe(document.id);
      expect(res.forms[0].is_completed).toBe(false);
      expect(res.forms[0].is_required).toBe(true);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get related policies based on roles for regular user", async function(done) {
    try {
      this.done = done;

      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showAdmissionPolicies',
          payload: {
            patient_id: patientId,
          }
        },
        jar: regularUser.rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      expect(res.statusCode).toBe(200);

      res = res.body;

      expect(res.document_types.length).toBe(0);
      expect(res.forms.length).toBe(1);
      expect(res.checklists.length).toBe(0);
      expect(res.forms[0].is_completed).toBe(false);
      expect(res.forms[0].is_required).toBe(true);

      done();
    } catch (err) {
      helpers.errorHandler.bind(this)(err);
    }
  });

  it("should get error when patient_id is not passed", async function(done) {
    try {
      let res = await rp({
        method: 'post',
        uri: `${env.appAddress}/api`,
        body: {
          context: 'Reception',
          is_command: false,
          name: 'showAdmissionPolicies',
          payload: {
          }
        },
        jar: adminUser.rpJar,
        json: true,
        resolveWithFullResponse: true,
      });

      this.fail('fetch policy list without specifying the patient_id');
      done();
    } catch (err) {
      expect(err.statusCode).toBe(500);
      done();
    }
  });
});