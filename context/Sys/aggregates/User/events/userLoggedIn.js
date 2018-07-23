const bycript = require('../../../../../utils/bcrypt');

module.exports = (user, payload) => {
  user = user.get({plain: true});
  return bycript.comparePassword(user.password, payload.password)
    .then(res => Promise.resolve(user));
}