const error = require('../../../utils/errors.list');
const PersonRepository = require('../repositories/personRepository');

module.exports = async (payload) => {
    try {
        if (!payload)
            throw error.payloadIsNotDefined;
        ['offset', 'limit', 'name', 'role'].forEach(el => {
            if (!payload.hasOwnProperty(el))
                throw error.incompleteData;
        });

        const personRepo = new PersonRepository();
        let data = await personRepo.searchPerson(payload);

        return Promise.resolve({
            count: data.count,
            data: data.rows
        });
    } catch (err) {
        throw err;
    }
}