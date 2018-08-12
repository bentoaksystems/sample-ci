const HookPolicyRepository = require('../../Shared-Kernel/repositories/hookPolicyRepository');
const helpers = require('../../../utils/helpers');

module.exports = async (payload, user) => {
  try {
    if (!payload.patient_id)
      throw new Error("Patient's id is not defined");

    let hookPolicies = (await new HookPolicyRepository().getPolicies('Reception', 'Admission')).get({plain: true}).context_hook_policies;
    hookPolicies = helpers.filterPolicies(hookPolicies, user);

    // Check documents/forms and checklist to be completed
    const PatientRepository = require('../repositories/patientRepository');

    // Check documents
    for (let index = 0; index < hookPolicies.document_types.length; index++) {
      const hasDocument = await new PatientRepository().getPatientDocumentsBasedOnType(payload.patient_id, hookPolicies.document_types[index].document_type_id);
      hookPolicies.document_types[index].file_path = hasDocument.length ? hasDocument[0].file_path : null;
      hookPolicies.document_types[index].document_id = hasDocument.length ? hasDocument[0].id : null;
      hookPolicies.document_types[index].is_uploaded = !!hasDocument.length;
    }

    // Check checklists
    for(let index = 0; index < hookPolicies.checklists.length; index++) {
      const filledChecklist = await new PatientRepository().getPatientChecklistFormById(payload.patient_id, hookPolicies.checklists[index].checklist_id, false);
      hookPolicies.checklists[index].data_json = filledChecklist ? filledChecklist.data_json : null;
      hookPolicies.checklists[index].is_completed = !!(filledChecklist && Object.keys(filledChecklist.data_json).length);
    }


    // Check forms
    for(let index = 0; index < hookPolicies.forms.length; index++) {
      const filledForm = await new PatientRepository().getPatientChecklistFormById(payload.patient_id, hookPolicies.forms[index].form_id, true);
      hookPolicies.forms[index].data_json = filledForm ? filledForm.data_json : null;
      hookPolicies.forms[index].is_completed = !!(filledForm && Object.keys(filledForm.data_json).length);
    }

    return Promise.resolve(hookPolicies);
  } catch (err) {
    throw err;
  }
};
