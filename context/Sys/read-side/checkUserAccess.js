const errors = require('../../../utils/errors.list');
const UserRepository = require('../repositories/userRepository');

const ignoreActions = [
  'userIsValid',
];

module.exports = async (payload) => {

  try {

    let user = await new UserRepository().getById(payload.id, true);

    if (!user)
      throw errors.noUser;

    user = user.get({plain: true});

    user.roles = user.person.staffs.map(el => el.role);
    user.actions = user.person.staffs.reduce((a, b) => a.concat(b.role.role_actions.map(el => {
      return {action: el.action, access: el.access}
    })), []);

    if (!payload.name || !payload.context)
      throw errors.incompleteData;

    if (user.username === 'admin')
      return Promise.resolve(user);

    const foundAction = ignoreActions.map(el => el.toLowerCase()).includes(payload.name.toLowerCase()) ? true :
      user.actions.find(el => el.action.context.toLowerCase() === payload.context.toLowerCase() &&
        (el.action.name.toLowerCase() === payload.name.toLowerCase() ||
          (payload.is_command && el.access.toLowerCase().includes('write/*')) || (!payload.is_command && el.access.toLowerCase().includes('read/*'))));

    return foundAction ? Promise.resolve(user) : Promise.reject(errors.noAccess);
  } catch (err) {
    throw err
  }
}