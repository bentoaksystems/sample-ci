const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db');

const queries = {
    'showStaff': '',
    'searchPerson': '',
    'showOnePerson': '',

};

const commands = {
    'addPerson': async (payload, user) => {
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
        /* Questions:
            only one db call for each repo func? NOT
            asyc/await in transactions
            shall move commands to files? YES
            promise OR async/await? LATTER
        */
        if (!payload)
            throw error.payloadIsNotDefined;
        ['firstname', 'surname', 'title', 'national_id'].forEach(el => {
            if (!payload[el])
                throw error.incompleteData;
        });
        ['province', 'city', 'street', 'district', 'postal_code'].forEach(el => {
            if (!payload.address[el])
                throw error.incompleteData;
        });

        const person_repo = require('./repositories/personRepository');
        console.log('@@@@@@@@: ', person_repo);
        
        let person = await person_repo.getById(payload);
        // let person;
        await person.addressAssigned(payload.address);
        return person.getId();
    },
    'assignRolesToPerson': async (payload, user) => {
        if (!payload)
            throw error.payloadIsNotDefined;
        if (!payload.person_id)
            throw error.incompleteData;
        if (!Array.isArray(payload.roles) || !payload.roles.length)
            throw new Error('roles are not valid');

        let staff = new require('./write-side/aggregates/staff')(payload.person_id);
        staff.newRolesAssigned(payload.roles);
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