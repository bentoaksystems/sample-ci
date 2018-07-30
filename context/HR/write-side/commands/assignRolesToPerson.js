const errors = require('../../../../utils/errors.list');
const db = require('../../../../infrastructure/db');

const PersonRepository = require('../../repositories/personRepository');

module.exports = async (payload, user) => {
    if (!payload)
        throw error.payloadIsNotDefined;
    if (!payload.person_id)
        throw error.incompleteData;
    if (!Array.isArray(payload.roles) || !payload.roles.length)
        throw new Error('roles are not valid');

    let person = await PersonRepository.getById(payload.person_id);
    person.assignRoles(payload.roles);
    return person.newRolesAssigned();
};