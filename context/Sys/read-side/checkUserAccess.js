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

    user.roles = user.staff.role;
    user.actions = user.staff.role.role_actions.map(el => el.action);
    user.person = user.staff.person;

    if (!payload.name || !payload.context)
      throw errors.incompleteData;

    if (user.username === 'admin')
      return Promise.resolve(user);

    const foundAction = ignoreActions.map(el => el.toLowerCase()).includes(payload.name.toLowerCase()) ? true :
      user.actions.find(el => el.context.toLowerCase() === payload.context.toLowerCase() &&
        el.name.toLowerCase() === payload.name.toLowerCase());

    return foundAction ? Promise.resolve(user) : Promise.reject(errors.noAccess);
  } catch (err) {
    throw err
  }
}