const bycript = require('../../../utils/bcrypt');
const errors = require('../../../utils/errors.list');
const UserRepository = require('../repositories/userRepository');


module.exports = async (payload) => {

  try {

    let user = await new UserRepository().getByUserName(payload.username, true);
    if (!user)
      throw errors.noUser;

    return bycript.comparePassword(user.password, payload.password)
      .then(res => {

        if (!res)
          return Promise.reject(errors.invalidPassword)

        user = user.get({
          plain: true
        });

        let accessed_routes;
        if (user.username === 'admin')
          accessed_routes = ['_all_'];
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

      });

  } catch (err) {
    throw err;
  }

}