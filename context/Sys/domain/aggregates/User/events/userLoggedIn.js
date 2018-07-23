const bycript = require('../../../../../../utils/bcrypt');

module.exports = (user, payload) => {
  console.log('user: ', user.get({plain: true}));
  return bycript.comparePassword(user.get({plain: true}).password, payload.password);
}