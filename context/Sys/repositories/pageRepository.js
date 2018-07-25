const Page = require('../../../infrastructure/db/models/page.model');

load = () => {
  return Page.model().findAll();
}

module.exports = {
  load
}