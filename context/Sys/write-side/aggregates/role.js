
module.exports = class Role {

  constructor(id) {
    this.id = id;
    this.pages = [];
    this.pageExtraAccess = [];
    this.actions = [];
    this.actionExtraAccess = [];
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
      }

    } else {
      if (!this.pageExtraAccess.find(x => x === access))
        this.pageExtraAccess.push(access);
      return roleRepository.grantPageAccess(this.id, null, access);
    }
  }


}
