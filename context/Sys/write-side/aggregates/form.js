const FormRepository = require('../../repositories/FormRepository');

class Form {
  constructor(id, user_id, name, context, formFieldList) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.context = context;
    this.formFieldList = formFieldList;
  }

  assignFormBasicInfo(payload, user) {
    this.form_info = {
      user_id: user.id,
      name: payload.name,
      context: payload.context,
    };
  }

  assignFormFields(formFieldList) {
    this.formFieldList = formFieldList;
  }

  async formCreated() {
    this.id = await new FormRepository().createForm(this.form_info, this.id);
    return new FormRepository().assignFormFieldsToForm(this.formFieldList, this.id);
  }

  async formUpdated() {
    this.id = await new FormRepository().createForm(this.form_info, this.id);
    return new FormRepository().assignFormFieldsToForm(this.formFieldList, this.id);
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
