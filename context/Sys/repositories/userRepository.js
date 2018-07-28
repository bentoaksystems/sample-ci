const User = require('../../../infrastructure/db/models/user.model');
const Person = require('../../../infrastructure/db/models/person.model');
const Staff = require('../../../infrastructure/db/models/staff.model');
const Role = require('../../../infrastructure/db/models/role.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');
const Action = require('../../../infrastructure/db/models/action.model');
const PageRole = require('../../../infrastructure/db/models/page_role.model');
const Page = require('../../../infrastructure/db/models/page.model');
const IUser = require('../write-side/aggregates/user');


/**
 * QUERY RELATED REPOSITORIES:
 */

getCompleteQuery = () =>{
  return completeLoad = [
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
    }
  ]
  
}

getByUserName = async (username, complete = false) => {

  
  if (!username)
    throw new Error('username is not defined');


  const query = {
    where: {username}
  };

  if (complete)
    query.include = getCompleteQuery();

  return User.model().findOne(query);
}

getById = async (id, complete = false) => {


  if (!id)
    throw new Error('user id is not defined');

  const query = {
    where: {id}
  };

  if (complete)
    query.include = getCompleteQuery();

  return User.model().findOne(query);
}

/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
 * e.g: IUser  = require ('../write-side/aggregates/user.js')
 * 
 * **/

getIUserById = async (id) => {
  if (!id)
    throw new Error('user id is not defined');

  const user = await User.findOne({
    where: {id}
  });

  return new IUser(user.id);


}

newPageAssigned = (user_id, page_id) => {

  return PageRole.findOrCreate({where: {user_id, page_id}})
    .spread((page_role, created) => {
      return Promise.resolve();
    });
}

module.exports = {
  getByUserName,
  getById,
  getIUserById,
  newPageAssigned
}