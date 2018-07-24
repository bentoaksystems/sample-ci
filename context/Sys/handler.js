
const UserRepository = require('./repositories');
const errors = require('../../utils/errors.list');

const queries = {
  'loginUser': [
    require('./aggregates/User/events/userLoggedIn'),
    require('./aggregates/User/events/userDataIsFiltered'),
  ],
  'userCheck': [
    require('./aggregates/User/events/userHadAccess'),
  ],
  'userIsValid': [
    require('./aggregates/User/events/userDataIsFiltered'),
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
      case 'userCheck':
        result = await UserRepository.loadById(query.payload.id);
        break;
      case 'userIsValid':
        result = await UserRepository.loadById(user.id);
        break;
    }

    /**
     * all queries will be called sequentially one after each other
     * each query change state of user and passed it along with payload to next query 
     */
    return queries[query.name].length ? queries[query.name].reduce((x, y) => x.then(r => y(r, query.payload)), Promise.resolve(result, query.payload)) : Promise.resolve(result);
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


module.exports = {
  handler,
  queries,
};
