
class Person {

    constructor(id = null) {
        // id === null -> create | o.w. -> update
        this.id = id;
        this.person_info = {};
        this.address = {};
        this.roles = [];
        this.user = {};
    }

    assignPersonInfo(person_info) {
        this.person_info = {
            firstname: person_info.firstname,
            surname: person_info.surname,
            national_code: person_info.national_code,
            title: person_info.title,
        };
    }

    assignAddress(address) {
        this.address = address;
    }

    async personAdded() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        this.id = await PersonRepository.createOrUpdatePerson(this.person_info, this.id);
        return PersonRepository.assignAddressToPerson(this.address, this.id);
    }

    async personUpdated() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        this.id = await PersonRepository.createOrUpdatePerson(this.person_info, this.id);
        return PersonRepository.assignAddressToPerson(this.address, this.id);
    }

    async newRolesAssigned(roles) {
        this.roles = roles;
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        await PersonRepository.removePersonRoles(this.id);
        return PersonRepository.assignPersonRoles(this.roles, this.id);
    }

    async userAssigned(user) {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();

        this.user = {
            username: user.username,
            password: user.password,
        };

        if (user.id !== null)
            this.user['id'] = user.id;

        this.user.id = await PersonRepository.assignUserToStaff(this.user, this.id);
        return Promise.resolve();
    }

    async personRemoved() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        return PersonRepository.removePerson(this.id);
    }

    getId() {
        return Promise.resolve({person_id: this.id});
    }
}

module.exports = Person;