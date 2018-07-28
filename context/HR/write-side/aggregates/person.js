const PersonRepository = require('../../repositories/personRepository');

class Person {

    constructor(id) {
        this.id = id;
        this.address = {};
    }

    async addressAssigned(address) {
        return Promise.resolve();
    }

    getId() {
        return Promise.resolve(this.id);
    }
}

module.exports = Person;