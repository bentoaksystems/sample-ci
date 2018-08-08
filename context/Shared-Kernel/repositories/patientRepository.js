const Person = require('../../../infrastructure/db/models/person.model');
const EMR = require('../../../infrastructure/db/models/emr.model');
const EMRDoc = require('../../../infrastructure/db/models/emrdoc.model');
const Address = require('../../../infrastructure/db/models/address.model');
const TypeDictionary = require('../../../infrastructure/db/models/type_dictionary.model');
const db = require('../../../infrastructure/db');

module.exports = class PatientRepository {
  constructor() {}

  async getPatients(search_data, offset, limit) {
    let conditions = [];

    if (search_data.name && search_data.name.trim())
      conditions.push(
        db
          .sequelize()
          .where(db.sequelize().fn('concat', db.sequelize().col('firstname'), ' ', db.sequelize().col('surname')), {
            $iLike: `%${search_data.name.trim()}%`
          })
      );

    ['mobile_number', 'national_code'].forEach(el => {
      if (search_data[el] && search_data[el].trim()) {
        const cond = {};
        cond[el] = { [db.Op.like]: '%' + search_data[el].trim() + '%' };
        conditions.push(cond);
      }
    });

    if (search_data.patient_type_id) conditions.push({ '$emr.patient_type_id$': search_data.patient_type_id });

    if (search_data.is_exited !== null && search_data.is_exited !== undefined) {
      if (search_data.is_exited) conditions.push({ '$emr.exit_date$': { [db.Op.ne]: null } });
      else conditions.push({ '$emr.exit_date$': { [db.Op.eq]: null } });
    }

    return Person.model()
      .findAndCountAll({
        where: {
          $and: conditions
        },
        include: [
          {
            model: EMR.model(),
            required: true,
            include: [
              {
                model: TypeDictionary.model(),
                as: 'patientType'
              },
              {
                model: TypeDictionary.model(),
                as: 'exitType'
              }
            ]
          }
        ],
        offset: offset || 0,
        limit: limit || 10
      })
      .then(result => {
        return Promise.resolve({ count: result.count, patients: result.rows });
      });
  }

  async getPatientDetial(person_id) {
    const person_info = await Person.model().find({
      where: {
        id: person_id
      },
      include: [
        {
          model: EMR.model(),
          required: true,
          include: [
            {
              model: TypeDictionary.model(),
              as: 'patientType'
            },
            {
              model: EMRDoc.model()
            }
          ]
        },
        { model: Address.model() }
      ]
    });
    return Promise.resolve(person_info);
  }
};
