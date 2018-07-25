const errors = require('../../../../../utils/errors.list');
const ignoreActions = [
  'userIsValid',
];

module.exports = (repo, payload) => {
  if (!repo)
  const user = repo.UserRepository
if (!user)
  return Promise.reject(errors.noUser);

  usre = user.get({plain: true});

  user.roles = user.staff.role;
  user.actions = user.staff.role.role_actions.map(el => el.action);
  user.person = user.staff.person;

  if (!payload.name || !payload.context)
    return Promise.reject(errors.incompleteData);

  const foundAction = ignoreActions.map(el => el.toLowerCase()).includes(payload.name.toLowerCase()) ? true :
  user.actions.find(el => el.context.toLowerCase() === payload.context.toLowerCase() &&
    el.name.toLowerCase() === payload.name.toLowerCase());

  return foundAction ? Promise.resolve(user) : Promise.reject(errors.noAccess);
}