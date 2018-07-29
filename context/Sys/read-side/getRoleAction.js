const RoleRepository = require('../repositories/roleRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    const roles_actions = await RoleRepository.getRolesActions();
    if (!roles_actions)
      throw new Error('roles_actions not found');

    const returnResult = [];
    const roleIds = [];
    roles_actions.forEach(element => {
      let newObj = {};
      if (roleIds.includes(element['id'])) {
        const foundIndex = returnResult.findIndex(el => el['role_id'] === element['id']);
        returnResult[foundIndex]['actions'].push(element['role_actions.action_id']);
      } else {
        newObj['role_id'] = element['id'];
        newObj['role_name'] = element['name'];
        newObj['actions'] = element['role_actions.action_id'] ? [element['role_actions.action_id']] : [];
        roleIds.push(element['id']);
        returnResult.push(newObj);
      }
    });

    return Promise.resolve(returnResult);

  } catch (err) {
    throw err;
  }


}