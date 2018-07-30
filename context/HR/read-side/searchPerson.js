const PersonRepository = require('../repositories/personRepository');

module.exports = async (payload) => {
    try {
        let staff = await PersonRepository.searchPerson();
        // maybe need to change structure to match with client
        return Promise.resolve(staff);
    } catch(err) {
        throw err;
    }
}