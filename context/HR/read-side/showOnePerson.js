const PersonRepository = require('../repositories/personRepository');

module.exports = async (payload) => {
    try {
        if (!payload)
            throw error.payloadIsNotDefined;
        if (!payload['person_id'])
            throw error.incompleteData;

        const personRepo = new PersonRepository();
        let staff = await personRepo.showOnePersonDetails(payload.person_id);

        let person = {
            id: staff.id,
            firstname: staff.firstname,
            surname: staff.surname,
            national_code: staff.national_code,
            title: staff.title,
            addresses: staff.addresses[0],
            user: staff.user,
            roles: [],
        };
        if (staff.staffs) {
            staff.staffs.forEach(r => {
                if (!r.role || !r.role.id || !r.role.name)
                    return;
                person.roles.push({
                    id: r.role.id,
                    name: r.role.name
                });
            })
        }
        return Promise.resolve(person);
    } catch (err) {
        throw err;
    }
}