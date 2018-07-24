const bycript = require('../../../../../utils/bcrypt');
const errors = require('../../../../../utils/errors.list');

module.exports = (user, payload) => {
  if (!user)
    return Promise.reject(errors.noUser);

  return bycript.comparePassword(user.password, payload.password)
    .then(res => Promise.resolve(user));
}