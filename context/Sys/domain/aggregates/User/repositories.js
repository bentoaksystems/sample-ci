const User = require('../../../../../infrastructure/db/models/user.model');

load = (username) => {

  return User.model().findOne({

    where: {username: 'aProject'},

  })


}