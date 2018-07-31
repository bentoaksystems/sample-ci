const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class addPatient extends BaseCommand {

  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      console.log(payload);
      if (!payload.national_id || !payload.firstname || !payload.surname || !payload.mobile || !payload.phone || !payload.title)
        throw new Error('incomplete payload for adding a new patient');
      const repo = new PersonRepository();
      const person = await repo.makeEmptyPatient();

      return super.execut(async () => {
        return person.createNewPatient(payload);
      });

    } catch (err) {
      throw err;
    }
  }
}

module.exports = addPatient;


