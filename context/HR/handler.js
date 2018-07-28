const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db');

const queries = {
    'showStaff': '',
    'searchPerson': '',
    'showOnePerson': '',
    
};

const commands = {
    'addPerson': (payload, user) => {
        /**
         * NOTE: the process should be like this
         * get something from db OR create something AS a domain object, i.e. IPerson
         * then make the necessary changes THERE, i.e. add the address or something
         * and then, save them all from IPerson object to the database
         * 
         * DB calls are to be in Repositories
         * Other functionalities will be handled in the IPerson methods
         * the whole wrapper functionality will be placed in here
         */
        const person_repo = require('./repositories/personRepository');
        let person;
        person_repo.findOrCreatePerson(payload)
            .then(res => {
                person = res;
                return person.addressAssigned(payload.address);
            })
            .then(res => {
                return person.getId();
            });
    },
    'assignRolesToPerson': async (payload, user) => {
        const staff_repo = require('./repositories/staffRepository');
        await staff_repo.newRolesAssignedToPerson(payload.roles, payload.person_id);
    },
    'assignUserToPerson': async (payload, user) => {

    },
    'deletePerson': async (payload, user) => {

    }
};

queryHandler = async (query, user) => {
    if (!queries[query.name])
        throw errors.queryNotFound;

    return queries[query.name](query.payload, user);
}

commandHandler = async (command, user) => {
    if (!commands[command.name])
        throw errors.commandNotFound;

    if (!command.payload)
        throw errors.payloadIsNotDefined;

    return db.sequelize().transaction(function (t1) {
        return commands[command.name](command.payload, user);
    });
}

handler = async (body, user) => {
    try {
        if (body.is_command)
            return commandHandler(body, user);
        else
            return queryHandler(body, user);
    } catch (err) {
        throw err;
    }
};

module.exports = {
    handler,
    queries,
    commands,
};