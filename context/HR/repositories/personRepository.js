
const Person = require('../../../infrastructure/db/models/person.model');
const IPerson = require('../write-side/aggregates/person');

/**
 * QUERY RELATED REPOSOTIROES:
 */


/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPerson())
 * e.g: IPerson  = require ('../write-side/aggregates/person.js')
 * 
 * **/

findOrCreatePerson = async (person_info) => {
    const query = {
        firstname: person_info.firstname,
        surname: person_info.surname,
        title: person_info.title,
        national_code: person_info.national_id,
    };

    let person;
    if (!person_info.person_id) {
        person = await Person.create(query);
    } else {
        query['id'] = person_info.person_id;
        person = await Person.update(query);
    }

    return new IUser(person.id);
};