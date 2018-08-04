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

  async getOneForm(form_id) {
   const form =  await Form.model().findOne({where: {id: form_id}});
   const form_fields = await FormField.model().findAll({where:{form_id : form.id}});
   return Promise.resolve({
       form: form,
       form_fields: form_fields
   })
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/

  async findOrCreate(id) {
    if (id) {
      const form = await Form.model().findById(id);

      if (!form)
        throw new Error('form with this id is not found');

      return new IForm(form.id);
    } else {
      return new IForm();
    }
  }

  async getFormById(id) {
    if (!id)
      throw new Error('id is not passed to get form');

    const form = await Form.model().findById(id);
    console.log(form);

    if (!form)
      throw new Error('form with this id is not found');

    return new IForm(form.id, form.user_id, form.name, form.context);
  }

  async formCreated(form_info, id) {
    if (!id) {
      let form = await Form.model().create(form_info);
      id = form.id;
    } else {
      form_info['id'] = id;
      await Form.model().update(form_info, {where: {id}});
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

  async removeFormField(id) {
    return FormField.model().destroy({where:{form_id : id}});
  }

  async deleteForm(id) {
    return Form.model().destroy({where: {id: id}});
  }
}
module.exports = FormRepository;