const FormRepository = require('../../repositories/FormRepository');

class Form {
  constructor(id, user_id, name) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
  }

  assignFormBasicInfo(payload, user) {
    this.form_info = {
      user_id: user.id,
      name: payload.name,
    };
  }

  assignFormFields(formFieldList) {
    this.formFieldList = formFieldList;
  }

  async formCreated() {
    this.id = await new FormRepository().createForm(this.form_info);
    return new FormRepository().assignFormFieldsToForm(this.formFieldList, this.id);
  }


  async formUpdated(form_id) {
    await new FormRepository().updateFormBasicInfo(this.form_info, form_id);
    return new FormRepository().assignEditedFormFieldsToForm(this.formFieldList, form_id);
  }

  async FormDeleted(form_id) {
    await new FormRepository().removeFormField(form_id);
    return new FormRepository().deleteForm(form_id);
  }

  getId() {
    return Promise.resolve(this.id);
  }
}

module.exports = Form;
