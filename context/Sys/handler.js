
const UserRepository = require('./domain/aggregates/User/repositories');
const errors = require('../../utils/errors.list');

const queries = {
  'loginUser': [
    require('./domain/aggregates/User/events/userLoggedIn')
  ]
}

queryhandler = async (query) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  try {
    let user;
    switch (quezry.name) {

      case 'loginUser':
        user = await UserRepository.load(query.payload.username, query.payload.password);
        break;
    }
    /**
     * all queries will be called sequentially one after each other
     * each query change state of user and passed it along with payload to next query 
     */
    return queries[query.name].reduce((x, y) => x.then(y), Promise.resolve(user, query.payload));
  }
  catch (err) {
    throw err;
  }
}

commandHandler = async (body) => {
}

handler = async (body) => {

  try {
    if (body.is_command)
      return commandHandler(body);
    else
      return queryhandler(body);
  } catch (err) {
    throw err;
  }
}


module.exports = handler