const Role = require('../../../infrastructure/db/models/role.model');

load = () => {
  return Role.model().findAll();
}





module.exports = {
  load
}