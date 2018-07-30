const errors = require('../../../../utils/errors.list');
const db = require('../../../../infrastructure/db');

const PersonRepository = require('../../repositories/personRepository');

module.exports = async (payload, user) => {
    if (!payload)
        throw error.payloadIsNotDefined;
    if (!payload.person_id)
        throw error.incompleteData;
    ['username', 'password'].forEach(el => {
        if (!payload[el])
            throw error.incompleteData;
    });

    // Question: shouldn't the user be assigned to Person, instead of Staff ?
    // Answer: NO! we have n staff that have 1 person_id and 1 user_id !
    // literally, in all the rows, the person_id == user_id !
    let person = await PersonRepository.getById(payload.person_id);
    await person.userAssigned(payload);
};