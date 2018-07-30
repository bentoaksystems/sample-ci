
const errors = require('../../../../utils/errors.list');
const db = require('../../../../infrastructure/db');

const PersonRepository = require('../../repositories/personRepository');

module.exports = async (payload, user) => {
    /**
         * NOTE: the process should be like this
         * get something from db OR create something AS a domain object, i.e. IPerson
         * then make the necessary changes THERE, i.e. add the address or something
         * and then, save them all from IPerson object to the database
         * 
         * DB calls are to be in Repositories
         * Other functionalities will be handled in the IPerson methods
         * the whole wrapper functionality will be placed in here
         */
    /* Questions:
        only one db call for each repo func? NOT
        asyc/await in transactions
        shall move commands to files? YES
        promise OR async/await? LATTER
    */
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

    let person = await PersonRepository.getById(payload.person_id);
    person.assignPersonInfo(payload);
    person.assignAddress(payload.address);
    await person.personAddedOrUpdated();
    return person.getId();
};