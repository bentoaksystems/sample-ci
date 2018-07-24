const User = require('../../infrastructure/db/models/user.model');
const Person = require('../../infrastructure/db/models/person.model');
const Staff = require('../../infrastructure/db/models/staff.model');
const Role = require('../../infrastructure/db/models/role.model');
const RoleAction = require('../../infrastructure/db/models/role_action');
const Action = require('../../infrastructure/db/models/action.model');
const PageRole = require('../../infrastructure/db/models/page_role.model');
const Page = require('../../infrastructure/db/models/page.model');

load = async (username) => {
  return User.model().findOne({
    where: {username},
    include: [
      {
        model: Staff.model(),
        // as: 'staff',
        required: true,
        include: [
          {
            model: Person.model(),
            // as: 'person',
            required: true,
          },
          {
            model: Role.model(),
            // as: 'roles',
            required: true,
            include: [
              {
                model: RoleAction.model(),
                // as: 'roleAction',
                include: [
                  {
                    model: Action.model(),
                    // as: 'action',
                  }
                ]
              },
              {
                model: PageRole.model(),
                // as: 'pageRole',
                include: [
                  {
                    model: Page.model(),
                    // as: 'page',
                  }
                ]
              },
            ]
          }
        ]
      },
    ],
  });
}

loadById = async (id) => {
  return User.model().findOne({
    where: {id},
    include: [
      {
        model: Staff.model(),
        // as: 'staff',
        required: true,
        include: [
          {
            model: Person.model(),
            // as: 'person',
            required: true,
          },
          {
            model: Role.model(),
            // as: 'roles',
            required: true,
            include: [
              {
                model: RoleAction.model(),
                // as: 'roleAction',
                include: [
                  {
                    model: Action.model(),
                    // as: 'action',
                  }
                ]
              },
              {
                model: PageRole.model(),
                // as: 'pageRole',
                include: [
                  {
                    model: Page.model(),
                    // as: 'page',
                  }
                ]
              },
            ]
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