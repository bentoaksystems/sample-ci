const Role = require('../../../infrastructure/db/models/role.model');
const Staff = require('../../../infrastructure/db/models/staff.model');

/**
 * COMMAND RELATED REPOSITORIES 
 */

oldRolesRemoved = async (person_id) => {
    return Staff.model().destroy({where: {person_id}});
}

newRolesAssigned = async (roles, person_id) => {
    let newData = [];
    roles.forEach(role =>
        newData.push({
            role_id: role.id,
            person_id: person_id,
        })
    );

    return Staff.model().bulkCreate(newData);
}


module.exports = {
    oldRolesRemoved,
    newRolesAssigned,
};