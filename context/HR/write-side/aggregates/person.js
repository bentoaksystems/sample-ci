
class Person {

    constructor(id) {
        this.id = id;
        this.address = {};
    }

    addressAssigned(address) {
        return new Promise((resolve, reject) => {
            const PersonRepository = require('../../repositories/personRepository');
            return PersonRepository.addressAssignedToPerson(address, this.id);
        })
        .then(res => {
            this.address = res;
            return Promise.resolve();
        })
    }

    getId() {
        return Promise.resolve(this.id);
    }
}

module.exports = Person;