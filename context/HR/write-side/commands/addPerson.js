
const error = require('../../../../utils/errors.list');
const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class AddPerson extends BaseCommand {
    constructor() {
        super();
    }

    async execute(payload, user) {
        try {
            if (!payload)
                throw error.payloadIsNotDefined;
            ['firstname', 'surname', 'title', 'national_id'].forEach(el => {
                if (!payload[el])
                    throw error.incompleteData;
            });
            ['province', 'city', 'street', 'district', 'postal_code'].forEach(el => {
                if (!payload.address[el])
                    throw error.incompleteData;
            });

            const personRepo = new PersonRepository();
            let person = await personRepo.getById(payload.person_id);
            person.assignPersonInfo(payload);
            person.assignAddress(payload.address);
            await person.personAddedOrUpdated();
            return person.getId();

        } catch (err) {
            throw err;
        }
    }
}

module.exports = AddPerson;