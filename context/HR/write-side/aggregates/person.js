
class Person {

    constructor(person_info, id = null) {
        // if id === null -> we're creating | o.w. -> updating
        this.id = id;
        this.person_info = {
            firstname: person_info.firstname,
            surname: person_info.surname,
            national_code: person_info.national_id,
            title: person_info.title,
        };
        this.address = {};
    }

    async addressAssigned(address) {
        console.log('reached here: ', address);
        this.address = address;
        await this.finalize();
        return Promise.resolve();
    }

    async finalize() {
        console.log('finalize');
        const PersonRepository = require('../../repositories/personRepository');
        this.id = await PersonRepository.personCreated(this.person_info, this.id);
        await PersonRepository.addressAssignedToPerson(this.address, this.id);
        return Promise.resolve();
    }

    getId() {
        return Promise.resolve(this.id);
    }
}

module.exports = Person;