const errors = require('../../../../../utils/errors.list');

module.exports = (repo, payload) => {
  if (!repo)
    const user = repo.UserRepository
  if (!user)
    return Promise.reject(errors.noUser);

  user = user.get({plain: true});
  return Promise.resolve({
    id: user.id,
    username: user.username,
    firstname: user.staff.person.firstname,
    surname: user.staff.person.surname,
    title: user.staff.person.title,
    accessed_routes: user.staff.role.page_roles.map(el => el.page.url),
    roles: user.staff.role,
  });
}