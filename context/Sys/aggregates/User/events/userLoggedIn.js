const bycript = require('../../../../../utils/bcrypt');
const errors = require('../../../../../utils/errors.list');

module.exports = (user, payload) => {
  if (!user)
    return Promise.reject(errors.noUser);

  user = user.get({plain: true});
  user.roles = user.staff.role;
  user.actions = user.staff.role.role_actions.map(el => el.action.name);
  user.pages = user.staff.role.page_roles.map(el => el.page.url);
  user.person = user.staff.person;
  return bycript.comparePassword(user.password, payload.password)
    .then(res => Promise.resolve(user));
}