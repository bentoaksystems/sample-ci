const BaseAggregate = require('../../../../utils/base-aggregate');


module.exports = class Role extends BaseAggregate {

  constructor(id, pages, pageExtraAccess, actions, actionExtraAccess) {
    super();

    this.id = id;
    this.pages = pages;
    this.pageExtraAccess = pageExtraAccess;
    this.actions = actions;
    this.actionExtraAccess = actionExtraAccess;

  }

  async pageAccessGranted(pageId, access = null) {

    const RoleRepository = require('../../repositories/roleRepository');
    const roleRepository = new RoleRepository();
    if (!access && pageId) {
      let page = this.pages.find(x => x.id === pageId);
      if (!page) {
        page = await roleRepository.loadPage(pageId);
        if (!page)
          throw new Error('page not found');

        this.pages.push(page);
        return roleRepository.grantPageAccess(this.id, page.id);
      } else
        return Promise.resolve();

    } else {
      if (!this.pageExtraAccess.find(x => x === access))
        this.pageExtraAccess.push(access);
      return roleRepository.grantPageAccess(this.id, null, access);
    }
  }


}
