module.exports = class Role {
  constructor(id, pages, pageExtraAccess, actions, actionExtraAccess) {
    this.id = id;
    this.pages = pages || [];
    this.pageExtraAccess = pageExtraAccess || [];
    this.actions = actions || [];
    this.actionExtraAccess = actionExtraAccess || [];
  }

  async pageAccessGranted(pageId, access = null) {
    const RoleRepository = require('../../repositories/roleRepository');
    const roleRepository = new RoleRepository();
    if (!access && pageId) {
      let page = this.pages.find(x => x.id === pageId);
      if (!page) {
        page = await roleRepository.loadPage(pageId);
        if (!page) throw new Error('page not found');

        this.pages.push(page);
        return roleRepository.grantPageAccess(this.id, page.id);
      } else return Promise.resolve();
    } else {
      if (!this.pageExtraAccess.find(x => x === access)) this.pageExtraAccess.push(access);
      return roleRepository.grantPageAccess(this.id, null, access);
    }
  }
  async pageAccessDenied(id) {
    const RoleRepository = require('../../repositories/roleRepository');
    const roleRepository = new RoleRepository();

    return roleRepository.denyPageAccess(id);
  }

  async actionAssignedToRole(actionIds, access = null) {
    const RoleRepository = require('../../repositories/roleRepository');
    const roleRepository = new RoleRepository();
    if (!access && actionIds && actionIds.length) {
      let actions = actionIds.filter(el => !this.actions.map(i => i.id).includes(el));
      if (!actions.length) return Promise.resolve();

      const promiseList = [];

      actions.forEach(async id => {
        let act = await roleRepository.loadAction(id);
        if (!act) throw new Error('Action not found');
        else {
          this.actions.push(act);
          promiseList.push(roleRepository.grantAction(this.id, act.id, null));
        }

        return Promise.all(promiseList);
      });
    } else {
      if (this.actionExtraAccess.find(el => el.access.toLowerCase() === access.toLowerCase())) return Promise.resolve();
      return roleRepository.grantAction(this.id, null, access);
    }
  }
};
