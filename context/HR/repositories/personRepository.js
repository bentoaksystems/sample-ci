
const Person = require('../../../infrastructure/db/models/person.model');
const Staff = require('../../../infrastructure/db/models/staff.model');
const Role = require('../../../infrastructure/db/models/role.model');
const User = require('../../../infrastructure/db/models/user.model');
const IPerson = require('../write-side/aggregates/person');
const Address = require('../../../infrastructure/db/models/address.model');

/**
 * QUERY RELATED REPOSOTIROES:
 */

showOnePersonDetails = async (person_id) => {

};

searchPerson = async (search) => {
    // now works for getting ALL STAFF
    // should implement search options
    return Staff.model().find({
        include: [{
            model: Staff.model(),
            required: true,
            include: [
                {
                    model: Person.model(),
                    required: true,
                }, {
                    model: Role.model(),
                    required: true,
                }
            ]
        }]
    });
};


/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPerson())
 * e.g: IPerson  = require ('../write-side/aggregates/person.js')
 * 
 * **/

getById = async (person_id) => {
    const person = await Person.model().findById(person_id);
    return new IPerson(person ? person.id : null);
};

personCreated = async (person_info, pid) => {
    if (!pid) {
        let person = await Person.model().create(person_info);
        pid = person.id;
    } else {
        person_info['id'] = pid;
        await Person.model().update(person_info);
    }
    return Promise.resolve(pid);
};

addressAssignedToPerson = async (address, person_id) => {
    // Object.assign(address, {person_id});// -> BUGGINSH! YESTERDAY NOT WORKING, NOW WORKING! WHAT ?! 
    console.log('on the way to assign addresses: ', address, person_id);
    let newAddress = await Address.model()
        .findOrCreate({
            where: address,
            defaults: {person_id}
        })
        .spread((newAddress, created) => {
            if (created)
                return Promise.resolve(newAddress);

            return newAddress.update(address);
        });
    console.log('created address: ', newAddress.get({plain: true}));
    return Promise.resolve(newAddress.get({plain: true}));
};

personRolesRemoved = async (person_id) => {
    return Staff.model().destroy({where: {person_id}});
};

personRolesAssigned = async (roles, person_id) => {
    // looks for user_id
    const staff = await Staff.model().findOne({where: {person_id}});

    const baseObj = {person_id};
    if (staff && staff.user_id)
        baseObj['user_id'] = staff.user_id;

    let newData = [];
    roles.forEach(role => newData.push(Object.assign({role_id: role.id}, baseObj)));
    return Staff.model().bulkCreate(newData);
};

userCreated = async (user_info) => {
    if (!user_info.id) {
        let user = await User.model().create(user_info);
        user_info.id = user.id;
    } else {
        await Person.model().update(user_info);
    }

    return Promise.resolve(user_info.id);
};

userAssignedToStaff = async (user_id, person_id) => {
    // should assign the user_id to all staff rows with {person_id}
    return Staff.model().update({person_id, user_id}, {fields: ['user_id']});
};

personRemoved = async (person_id) => {
    return Person.model().destroy({where: {person_id}});
};

userRemoved = async (user_id) => {
    return User.model().destroy({where: {id: user_id}});
};


module.exports = {
    showOnePersonDetails,
    searchPerson,
    getById,
    personCreated,
    addressAssignedToPerson,
    personRolesRemoved,
    personRolesAssigned,
    userCreated,
    userAssignedToStaff,
    personRemoved,
    userRemoved,
}