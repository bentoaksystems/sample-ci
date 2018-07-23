const User = require('../../../../../infrastructure/db/models/user.model');
const Person = require('../../../../../infrastructure/db/models/person.model');
const Staff = require('../../../../../infrastructure/db/models/staff.model');
const Role = require('../../../../../infrastructure/db/models/role.model');

load = async (username) => {
  return User.model().findOne({
    where: {username},
    include: [
      {
        model: Staff.model(),
        as: 'staff',
        required: true,
        include: [
          {
            model: Person.model(),
            as: 'person',
            required: true,
          },
          {
            model: Role.model(),
            as: 'role',
            required: true,
          }
        ]
      },
    ],
    attributes: {exclude: ['password']}
  });
}

loadById = async (id) => {
  return User.model().findOne({
    where: {id},
    include: [
      {
        model: Staff.model(),
        as: 'staff',
        required: true,
        include: [
          {
            model: Person.model(),
            as: 'person',
            required: true,
          },
          {
            model: Role.model(),
            as: 'role',
            required: true,
          }
        ]
      },
    ],
    attributes: {exclude: ['password']}
  })
}

module.exports = {
  load,
  loadById,
}