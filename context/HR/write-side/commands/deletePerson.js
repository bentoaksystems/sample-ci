const error = require('../../../../utils/errors.list');
const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class DeletePerson extends BaseCommand {
    constructor() {
        super();
    }

    async execute(payload, user) {
        try {
            if (!payload)
                throw error.payloadIsNotDefined;
            if (!payload.person_id)
                throw error.incompleteData;

            const personRepo = new PersonRepository();
            let person = await personRepo.findOrCreatePerson(payload.person_id);
            return person.personRemoved();

        } catch (err) {
            throw err;
        }
    }
}

module.exports = DeletePerson;