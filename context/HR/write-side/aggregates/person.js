const PersonRepository = require('../../repositories/personRepository');

class Person {

    constructor(id) {
        this.id = id;
        this.address = {};
    }

    async addressAssigned(address) {
        this.address = await PersonRepository.addressAssignedToPerson(address, this.id);
    }

    getId() {
        return Promise.resolve(this.id);
    }
}

module.exports = Person;