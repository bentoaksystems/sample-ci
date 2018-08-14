const Role = require('../../../infrastructure/db/models/role.model');
const RoleAction = require('../../../infrastructure/db/models/role_action');
const Action = require('../../../infrastructure/db/models/action.model');
const PageRole = require('../../../infrastructure/db/models/page_role.model');
const Page = require('../../../infrastructure/db/models/page.model');
const errors = require('../../../utils/errors.list');
const IRole = require('../write-side/aggregates/role');

class RoleRepository {

  async getIRoleById(id) {
    if (!id)
      throw new Error('role id is not defined');

    const role = await Role.model().findOne({
      where: { id }
    });
    if (role) {
      return new IRole(role.id);
    } else {
      throw new Error('no role found');
    }
  }

  async getIAction(id) {
    if (!id) throw new Error('role id is not defined');

    const role = await Role.model().findOne({
      where: { id },
      include: [{ model: RoleAction.model() }]
    });
    if (role) {
      let actions = [];
      if (role.role_actions.length) {
        actions = role.role_actions.map(el => el);
      }
      return new IRole(role.id, [], [], actions);
    } else {
      throw new Error('no role found');
    }
  }

  grantPageAccess(role_id, page_id, access = null) {
    if (access && !page_id) {
      return PageRole.model().create({ role_id, access });
    } else {
      return PageRole.model()
        .findOrCreate({ where: { role_id, page_id } })
        .spread((page_role, created) => {
          return Promise.resolve();
        });
    }
  }

  async denyPageAccess(id) {
    const pageRole = await PageRole.model().findOne({
      where: { id }
    });
    return pageRole.destroy();
  }

  loadPage(id) {
    return Page.model().findOne({ where: { id } });
  }

  roleAccecibleActionsShown(id) {
    return Role.model().find({
      where: {
        id
      },
      include: [
        {
          model: RoleAction.model(),
          attributes: ['action_id', 'access'],
          include: [
            {
              model: Action.model()
            }
          ]
        }
      ]
    });
  }

  loadAction(id) {
    return Action.model().findOne({ where: { id } });
  }

  grantAction(role_id, action_id, access) {
    if (access && !action_id) {
      return RoleAction.model()
        .findOrCreate({ where: { role_id, access } })
        .spread((action_role, created) => {
          if (!created) throw new Error('duplicate actions can not');
        });
    } else {
      return RoleAction.model()
        .findOrCreate({ where: { role_id, action_id } })
        .spread((action_role, created) => {
          return Promise.resolve();
        });
    }
  }

  denyAction(role_id, action_id, access) {
    if (access && !action_id) {
      return RoleAction.model().destroy({ where: { role_id, access } });
    } else {
      return RoleAction.model().destroy({ where: { role_id, action_id } });
    }
  }
}

module.exports = RoleRepository;
