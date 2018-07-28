const Role = require('../../../infrastructure/db/models/role.model');
const Staff = require('../../../infrastructure/db/models/staff.model');

/**
 * COMMAND RELATED REPOSITORIES 
 */

newRolesAssignedToPerson = async (roles, person_id) => {
    if (!Array.isArray(roles) || !roles.length)
        throw new Error('roles are not correct');
    if (!person_id)
        throw new Error('person id is not set');

    // delete all the current roles for the person
    await Staff.model().destroy({
        where: {person_id}
    });

    let newData = [];
    roles.forEach(role => {
        newData.push({
            role_id: role.id,
            person_id: person_id,
        });
    });
    // then, set all the new roles for the person
    return Staff.model().bulkCreate(newData)
        .then(() => {
            return Promise.resolve();
        });
}


module.exports = {
    newRolesAssignedToPerson
};