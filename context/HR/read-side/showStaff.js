const PersonRepository = require('../repositories/personRepository');

module.exports = async (payload) => {
    try {
        let staff = await PersonRepository.getPersonnelList();
        // maybe need to change structure to match with client
        return Promise.resolve(staff);
    } catch(err) {
        throw err;
    }
}