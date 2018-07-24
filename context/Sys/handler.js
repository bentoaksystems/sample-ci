
const UserRepository = require('./repositories/userRepository');
const RoleRepository = require('./repositories/roleRepository');
const PageRepository = require('./repositories/pageRepository');
const errors = require('../../utils/errors.list');

const queries = {
  'loginCheck': [
    require('./aggregates/User/events/userLoggedIn'),
    require('./aggregates/User/events/userHadAccess'),
  ],
  'checkAccess': [
    require('./aggregates/User/events/userHadAccess'),
  ],
  'loginUser': [
    // require('./aggregates/User/events/userAdded'),
    require('./aggregates/User/events/userLoggedIn'),
  ],
  'userCheck': [
    // require('./aggregates/User/events/userAdded'),
  ],
  'showRoles': [],
  'showPages': [],
}

queryhandler = async (query, user) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  try {
    let result;
    switch (query.name) {

      case 'loginCheck':
        result = await UserRepository.load(query.payload.username);
        break;
      case 'loginUser':
        result = await UserRepository.load(query.payload.username);
        break;
      case 'userCheck':
        result = await UserRepository.loadById(query.payload.id);
        break;
      case 'showRoles':
        result = await RoleRepository.load();
        break;
      case 'showPages':
        result = await PageRepository.load();
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


module.exports = handler