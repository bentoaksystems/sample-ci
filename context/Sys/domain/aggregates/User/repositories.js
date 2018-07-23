const User = require('../../../../../infrastructure/db/models/user.model');

load = async (username) => {
  return User.model().findOne({
    where: {username},
  });
}

loadById = async (id) => {
  return User.model().findById(id, {
    include: [
      {
        model: Staff,
        as: 'Staff',
        required: true,
        include: [
          {
            model: 'Person',
            as: 'Person',
            required: true,
          },
          {
            model: 'Role',
            as: 'role',
            required: true,
          }
        ]
      },
    ]
  })
}

module.exports = {
  load,
  loadById,
}