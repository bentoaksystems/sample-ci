const UserRepository = require('../repositories/userRepository');
const errors = require('../../../utils/errors.list');

module.exports = async (payload, _user) => {

  try {
    let user = await new UserRepository().getById(_user.id, true);
    if (!user)
      throw errors.noUser;

    user = user.get({plain: true});

    let accessed_routes;
    if (user.username === 'admin')
      accessed_routes = ['_all_']
    else
      accessed_routes = user.person.staffs.reduce((a, b) => a.concat(b.role.page_roles.map(el => el.page.url)), []);

    return Promise.resolve({
      id: user.id,
      username: user.username,
      firstname: user.person.firstname,
      surname: user.person.surname,
      title: user.person.title,
      accessed_routes,
      roles: user.person.staffs.map(el => el.role),
    });
  } catch (err) {
    throw err;
  }


}