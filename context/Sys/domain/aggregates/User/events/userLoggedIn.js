const bycript = require('../../../../../../utils/bcrypt');

module.exports = (user, payload) => {
  return bycript.comparePassword(user.password, payload.password)
    .then(res => Promise.resolve(user));
}