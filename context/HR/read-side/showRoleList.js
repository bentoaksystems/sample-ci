
module.exports = async () => {
    try {
        const RoleRepo = require('../../Shared-Kernel/repositories/roleRepository');
        const roleRepo = new RoleRepo();
        const roles = await roleRepo.getAll();
        return roles;
    } catch (err) {
        throw err;
    }
}