const PageRepository = require('../../repositories/pageRepository');

class User {

  constructor(id) {
    this.id = id;
    this.pages = [];
    this.actions = [];
  }

  async newPageAssigned(pageId) {
    const UserRepository = require('../../repositories/userRepository');
    const page = await PageRepository.getIPageById(pageId);
    this.pages.push(page);
    return UserRepository.newPageAssigned(this.id, page.id);
  }


}

module.exports = User