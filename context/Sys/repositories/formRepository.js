const Form = require('../../../infrastructure/db/models/form.model');
const FormField = require('../../../infrastructure/db/models/form_field.model');
const IForm = require('../write-side/aggregates/form');
const errors = require('../../../utils/errors.list');
const db = require('../../../infrastructure/db');

class FormRepository {
  /**
   * QUERY RELATED REPOSOTIROES:
   */

  async getAllForms() {
    return Form.model().findAll();
  }

  async getOneForm(form_id) {
    const form = await Form.model().findOne({where: {id: form_id}});
    const form_fields = await FormField.model().findAll({where: {form_id: form.id}});
    return Promise.resolve({
      form: form,
      form_fields: form_fields
    })
  }

  async getViewList() {
    return db.sequelize().query("select *\n" +
      "from INFORMATION_SCHEMA.views\n" +
      "WHERE table_schema = ANY (current_schemas(false));");
  }

  async executeViewQuery(query) {
    return db.sequelize().query(query);
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IForm())
   * e.g: IForm  = require ('../write-side/aggregates/form.js')
   *
   * **/


  async createNewForm() {
    return new IForm();
  }

  async getFormById(id) {
    if (!id)
      throw new Error('id is not passed to get form');

    const form = await Form.model().findById(id);

    if (!form)
      throw new Error('form with this id is not found');

    return new IForm(form.id, form.user_id, form.name);
  }

  async createForm(form_info) {
    let form = await Form.model().create(form_info);
    return Promise.resolve(form.id);
  }

  async assignFormFieldsToForm(formFieldList, form_id) {
    for (let i = 0; i < formFieldList.length; i++) {
      formFieldList[i].form_id = form_id;
      let newFormField = await FormField.model()
        .create(formFieldList[i]);
    }
    return Promise.resolve();
    console.log('Form fields entered');
  }


  async updateFormBasicInfo(form_info, form_id) {
    if (!form_id)
      throw new Error('id is not passed to update form');

    let form = await Form.model().update(form_info, {where: {id: form_id}});
    return Promise.resolve(form.id);
  }


  async assignEditedFormFieldsToForm(formFieldList, form_id) {
    let oldFormFieldList = await FormField.model().findAll({where: {form_id: form_id}});

    oldFormFieldList.forEach(el => {
      if (!(formFieldList.filter(item => item.hashKey === el.hashKey).length))
        return FormField.model().destroy(
          {
            where: {
              hashKey: el.hashKey,
              form_id: el.form_id,
              id: el.id,
            }
          });
    });


    for (let i = 0; i < formFieldList.length; i++) {
      formFieldList[i].form_id = form_id;
      await FormField.model()
        .findOrCreate({
          where: {
            hashKey: formFieldList[i].hashKey,
            form_id: form_id,
          }, defaults: {
            title: formFieldList[i].title,
            answerShowType: formFieldList[i].answerShowType,
            answerSource: formFieldList[i].answerSource ? formFieldList[i].answerSource : null,
            staticAnswerArray: formFieldList[i].staticAnswerArray ? formFieldList[i].staticAnswerArray : null,
            answerView: formFieldList[i].answerView ? formFieldList[i].answerView : null,
            fieldPriority: formFieldList[i].fieldPriority,
            hashKey: formFieldList[i].hashKey,
            form_id: formFieldList[i].form_id,
          }
        })
        .spread((editFormField, created) => {
          if (created) {
            return Promise.resolve();
          }
          else {
            return editFormField.update(formFieldList[i]);
          }
        });
    }
  }

  async removeFormField(id) {
    return FormField.model().destroy({where: {form_id: id}});
  }

  async deleteForm(id) {
    return Form.model().destroy({where: {id: id}});
  }
}

module.exports = FormRepository;


// return Promise.resolve(editFormField.get({plain: true}));