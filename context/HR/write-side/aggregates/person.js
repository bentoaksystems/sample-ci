
class Person {

    constructor(id = null) {
        // if id === null -> we're creating | o.w. -> updating
        this.id = id;
        this.person_info = {};
        this.address = {};
        this.roles = [];
        this.user = {};
        // StaffRepo needed? NOT!
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
        const PersonRepository = require('../../repositories/personRepository');
        this.id = await PersonRepository.personCreated(this.person_info, this.id);
        return PersonRepository.addressAssignedToPerson(this.address, this.id);
    }

    async newRolesAssigned() {
        const PersonRepository = require('../../repositories/personRepository');
        await PersonRepository.personRolesRemoved(this.id);
        return PersonRepository.personRolesAssigned(this.roles, this.id);
    }

    async userAssigned(user) {
        const PersonRepository = require('../../repositories/personRepository');
        this.user = {
            id: user.id || null,
            username: user.username,
            password: user.password,
        };

        this.user.id = await PersonRepository.userCreated(this.user);
        return PersonRepository.userAssignedToStaff(this.user.id, this.id);
    }

    async personRemoved() {
        const PersonRepository = require('../../repositories/personRepository');
        await PersonRepository.personRemoved(this.id);
        await PersonRepository.personRolesRemoved(person_id);
        return PersonRepository.userRemoved(this.user.id);
    }

    getId() {
        return Promise.resolve(this.id);
    }
}

module.exports = Person;