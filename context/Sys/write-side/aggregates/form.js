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

  async formCreatedOrUpdated() {
    this.id = await new FormRepository().formCreated(this.form_info, this.id);
    return new FormRepository().assignFormFieldsToForm(this.formFieldList, this.id);
  }

  getId() {
    return Promise.resolve(this.id);
  }
}

module.exports = Form;
