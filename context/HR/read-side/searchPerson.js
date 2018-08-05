const error = require('../../../utils/errors.list');
const PersonRepository = require('../repositories/personRepository');

module.exports = async (payload) => {
    try {
        if (!payload)
            throw error.payloadIsNotDefined;
        ['offset', 'limit', 'name', 'role'].forEach(el => {
            if (!payload.hasOwnProperty(el))
                throw error.incompleteData;
        });

        const personRepo = new PersonRepository();
        let staff = await personRepo.searchPerson(payload);

        let personnel = [];
        staff.forEach(s => {
            if (!s.staffs)
                return;
            let roles = [];
            s.staffs.forEach(r => {
                if (!r.role || !r.role.name)
                    return;
                roles.push(r.role.name);
            });
            personnel.push({
                person_id: s.id,
                firstname: s.firstname,
                surname: s.surname,
                roles,
                username: s.user && s.user.username || null,
            });
        });
        return Promise.resolve(personnel);
    } catch (err) {
        throw err;
    }
}