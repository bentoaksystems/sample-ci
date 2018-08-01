const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class updatePatient extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id || !payload.national_id || !payload.firstname || !payload.surname || !payload.mobile || !payload.phone || !payload.title)
        throw new Error('incomplete payload for adding a update patient');
      const repo = new PersonRepository();
      const person = await repo.getPatientById(payload.id);

      return super.execut(async () => {
        return person.updatePatientData(payload);
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = updatePatient;


