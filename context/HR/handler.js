const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db');

const queries = {

};

const commands = { 
    'addPerson': async (payload, user) => {
        const repo = require('./repositories/personRepository');
        let person = await repo.findOrCreatePerson(payload);
        await person.addressAssigned(payload.address);
        return person.getId();
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