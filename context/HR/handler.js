const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db');

const queries = {

};

const commands = { 
    'addPerson': async (payload, user) => {
        const person_repo = require('./repositories/personRepository');
        let person = await person_repo.findOrCreatePerson(payload);
        await person.addressAssigned(payload.address);
        return person.getId();
    },
    'assignRolesToPerson': async (payload, user) => {
        const staff_repo = require('./repositories/staffRepository');
        await staff_repo.newRolesAssignedToPerson(payload.roles, payload.person_id);
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