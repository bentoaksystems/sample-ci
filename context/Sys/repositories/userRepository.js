const BaseRepository = require('../../../utils/base-repository.js')
const User = require('../../../infrastructure/db/models/user.model');
const Person = require('../../../infrastructure/db/models/person.model');
const Staff = require('../../../infrastructure/db/models/staff.model');
const Role = require('../../../infrastructure/db/models/role.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');
const Action = require('../../../infrastructure/db/models/action.model');
const PageRole = require('../../../infrastructure/db/models/page_role.model');
const Page = require('../../../infrastructure/db/models/page.model');
const errors = require('../../../utils/errors.list');
const db = require ('../../../infrastructure/db');

class UserRepository extends BaseRepository {

  constructor(){
    super();
  }

  /*
 * QUERY RELATED REPOSITORIES:
 */

  getCompleteQuery() {
    return  [
      {
        model: Person.model(),
        required: true,
        include: [
          {
            model: Staff.model(),
            required: true,
            include: [
              {
                model: Role.model(),
                // required: true,
                include: [
                  {
                    model: RoleAction.model(),
                    include: [
                      {
                        model: Action.model(),
                      }
                    ]
                  },
                  {
                    model: PageRole.model(),
                    include: [
                      {
                        model: Page.model(),
                      }
                    ]
                  },
                ]
              }
            ]
          },
        ]
      }
    ]

  }

  async getByUserName(username, complete = false) {
    if (!username)
      throw new Error('username is not defined');

    const query = {
      where: {
        $and: [
          db.sequelize().where(db.sequelize().fn('LOWER', db.sequelize().col('username')), {$iLike: username})
        ]
      }
    };

    if (complete)
      query.include = this.getCompleteQuery();

    return User.model().findOne(query);
  }

  async getById(id, complete = false) {

    if (!id)
      throw new Error('user id is not defined');

    const query = {
      where: {id}
    };

    if (complete)
      query.include = this.getCompleteQuery();

    return User.model().findOne(query);
  }

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
   * e.g: IUser  = require ('../write-side/aggregates/user.js')
   * 
   * **/

  
}

UserRepository.Users = [];

module.exports = UserRepository;
