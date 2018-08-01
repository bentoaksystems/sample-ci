const Form = require('../../../infrastructure/db/models/form.model');
const FormField = require('../../../infrastructure/db/models/form_field.model');
const IForm = require('../write-side/aggregates/form');
const errors = require('../../../utils/errors.list');


class FormRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

 async getAllForms() {
    return Form.model().findAll();
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/

  async  getFormById(id){
    const form = await Form.model().findById(id);

    return new IForm(form ? form.id : null);
  }

  async formCreated(form_info, id){
    if (!id) {
      let form = await Form.model().create(form_info);
      id = form.id;
    } else {
      form_info['id'] = id;
      await Form.model().update(form_info);
    }
    console.log('Form created: ', id);
    return Promise.resolve(id);
  }


  async assignFormFieldsToForm(formFieldList, form_id) {

    for (let i = 0; i < formFieldList.length; i++) {
      let newFormField = await FormField.model()
        .findOrCreate({
          where: formFieldList[i],
          defaults: {form_id: form_id},

        })
        .spread((newFormField, created) => {
          if (created)
            return Promise.resolve(newFormField);

          return newFormField.update(formFieldList[i]);
        });
      // return Promise.resolve(newFormField.get({plain: true}));
    }

    console.log('Form fields entered');
  }

}

module.exports = FormRepository;