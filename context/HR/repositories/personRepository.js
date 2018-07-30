
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

getById = async (person_info) => {
    const person = await Person.model().findById(person_info.id);

    return new IPerson(person_info, person ? person.id : null);
}

personCreated = async (person_info, pid) => {
    if (!pid) {
        let person = await Person.model().create(person_info);
        pid = person.id;
    } else {
        query['id'] = pid;
        await Person.model().update(person_info);
    }
    console.log('at the end of personCreated: ', pid);
    return Promise.resolve(pid);
}

addressAssignedToPerson = async (address, person_id) => {

    // Object.assign(address, {person_id});// -> BUGGINSH! YESTERDAY NOT WORKING, NOW WORKING! WHAT ?! 
    // this should be findOrCreate
    console.log('on the way to assign addresses: ', address, person_id);
    let newAddress = await Address.model()
        .findOrCreate({
            where: address,
            defaults: {person_id}
        })
        .spread((newAddress, created) => {
            if (created)
                return Promise.resolve(newAddress);

            return newAddress.update(address);
        });
    console.log('created address: ', newAddress);
    return Promise.resolve(newAddress);
}


module.exports = {
    getById,
    personCreated,
    addressAssignedToPerson
}