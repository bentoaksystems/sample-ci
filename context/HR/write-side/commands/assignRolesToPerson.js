const error = require('../../../../utils/errors.list');
const BaseCommand = require('../../../../utils/base-command');
const PersonRepository = require('../../repositories/personRepository');

class AssignRolesToPerson extends BaseCommand {
    constructor() {
        super();
    }

    async execute(payload, user) {
        try {
            if (!payload)
                throw error.payloadIsNotDefined;
            if (!payload.person_id)
                throw error.incompleteData;
            if (!Array.isArray(payload.roles) || !payload.roles.length)
                throw new Error('roles are not valid');

            const personRepo = new PersonRepository();
            let person = await personRepo.getById(payload.person_id);
            person.assignRoles(payload.roles);
            return person.newRolesAssigned();

        } catch (err) {
            throw err;
        }
    }
}

module.exports = AssignRolesToPerson;