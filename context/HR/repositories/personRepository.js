
const Person = require('../../../infrastructure/db/models/person.model');
const IPerson = require('../write-side/aggregates/person');
const Address = require('../../../infrastructure/db/models/address.model');

/**
 * QUERY RELATED REPOSOTIROES:
 */


/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPerson())
 * e.g: IPerson  = require ('../write-side/aggregates/person.js')
 * 
 * **/

findOrCreatePerson = (person_info) => {
    return new Promise((resolve, reject) => {
        ['firstname', 'surname', 'title', 'national_id'].forEach(el => {
            if (!person_info[el])
                throw new Error('person data is incomplete');
        });

        const query = {
            firstname: person_info.firstname,
            surname: person_info.surname,
            title: person_info.title,
            national_code: person_info.national_id,
        };

        if (!person_info.person_id) {
            return Person.model().create(query);
        } else {
            query['id'] = person_info.person_id;
            return Person.model().update(query);
        }
    })
        .then(res => {
            return new IPerson(res.id);
        });
}

addressAssignedToPerson = async (address, person_id) => {
    if (!person_id)
        throw new Error('person id is not set');

    ['province', 'city', 'street', 'district', 'postal_code'].forEach(el => {
        if (!address[el])
            throw new Error('address data is incomplete');
    });

    // Object.assign(address, {person_id}); -> BUGGINSH!
    return Address.model().create({
        where: address,
    })
        .spread((created_address, created) => {
            console.log('created address: ', address, created_address);
            return Promise.resolve(created_address);
        });
}


module.exports = {
    findOrCreatePerson,
    addressAssignedToPerson
}