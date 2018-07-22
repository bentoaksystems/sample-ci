const bycript = require('../../../../../../utils/bcrypt');

userLoggedIn = (user, payload) => {
  return bycript.comparePassword(user.get({plain: true}).password, payload.password);
}