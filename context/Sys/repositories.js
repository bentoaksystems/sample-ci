const User = require('../../infrastructure/db/models/user.model');

load = async (username) => {
  return User.model().findOne({
    where: {username},
  });
}

loadById = async (id) => {
  return User.model().findById(id);
}

module.exports = {
  load,
  loadById,
}