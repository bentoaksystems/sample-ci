
const UserRepository = require('./domain/aggregates/User/repositories');
const errors = require('../../utils/errors.list');

const queries = {
  'loginUser': [
    require('./domain/aggregates/User/events/userLoggedIn')
  ]
}

queryhandler = async (query, user) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  try {
    let result;
    switch (query.name) {

      case 'loginUser':
        result = await UserRepository.load(query.payload.username);
        break;
      case 'checkAccess':
        result = await UserRepository.load(query.payload.id);
        break;
    }
    
    /**
     * all queries will be called sequentially one after each other
     * each query change state of user and passed it along with payload to next query 
     */
    return queries[query.name].reduce((x, y) => x.then(y), Promise.resolve(result, query.payload));
  }
  catch (err) {
    throw err;
  }
}

commandHandler = async (body, user) => {
}

handler = async (body, user) => {

  try {
    if (body.is_command)
      return commandHandler(body, user);
    else
      return queryhandler(body, user);
  } catch (err) {
    throw err;
  }
}


module.exports = handler