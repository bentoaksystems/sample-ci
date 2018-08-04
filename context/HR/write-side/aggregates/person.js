
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
            national_code: person_info.national_id,
            title: person_info.title,
        };
    }

    assignAddress(address) {
        this.address = address;
    }

    assignRoles(roles) {
        this.roles = roles;
    }

    async personAddedOrUpdated() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        this.id = await PersonRepository.personCreated(this.person_info, this.id);
        return PersonRepository.addressAssignedToPerson(this.address, this.id);
    }

    async newRolesAssigned() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        await PersonRepository.personRolesRemoved(this.id);
        return PersonRepository.personRolesAssigned(this.roles, this.id);
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

        this.user.id = await PersonRepository.userAssignedToStaff(this.user, this.id);
        return Promise.resolve();
    }

    async personRemoved() {
        const PR = require('../../repositories/personRepository');
        const PersonRepository = new PR();
        return PersonRepository.personRemoved(this.id);
    }

    getId() {
        return Promise.resolve({person_id: this.id});
    }
}

module.exports = Person;