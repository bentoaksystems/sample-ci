const UserRepository = require('../repositories/userRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    let user = await UserRepository.getById(_user.id, true);
    if (!user)
      throw errors.noUser;

    user = user.get({plain: true});

    let accessed_routes;
    if (user.username === 'admin')
      accessed_routes = ['_all_']
    else
      accessed_routes = user.staff.role.page_roles.map(el => el.page.url)

    return Promise.resolve({
      id: user.id,
      username: user.username,
      firstname: user.staff.person.firstname,
      surname: user.staff.person.surname,
      title: user.staff.person.title,
      accessed_routes,
      roles: user.staff.role,
    });
  } catch (err) {
    throw err;
  }


}