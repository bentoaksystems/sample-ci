const User = require('../../../../../infrastructure/db/models/user.model');

load = async (username) => {

  return User.model().findOne({
    where: {username},
  })
}

module.exports = {
  load
}