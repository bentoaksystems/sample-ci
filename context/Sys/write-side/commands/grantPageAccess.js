const RoleRepository = require('../../repositories/roleRepository')
const db = require('../../../../infrastructure/db');

module.exports = async (payload, user) => {
  let preRole;
  const repo = new RoleRepository();
  return db.sequelize().transaction(async () => {
    try {
      const role = await repo.getIRoleById(payload.roleId);
      preRole = {...role};
      return role.pageAccessGranted(payload.pageId, payload.access ? payload.access : null)
    } catch (err) {
      throw err;
    }
  }).catch(err => {
    if (preRole)
      repo.rollback(payload.roleId, repo.getRoles(), preRole);
    throw err;
  });
}