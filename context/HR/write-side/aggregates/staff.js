const StaffRepository = require('../../repositories/staffRepository');

class Staff {
    constructor(person_id) {
        this.related_person_id = person_id;
        this.roles = [];
    }

    newRolesAssigned(roles) {
        this.roles = roles;
        await StaffRepository.oldRolesRemoved(this.related_person_id);
        await StaffRepository.newRolesAssigned(roles, this.related_person_id);
        return Promise.resolve();
    }
}

module.exports = Staff;