
const _UserRepository = require('./repositories/userRepository');
const _RoleRepository = require('./repositories/roleRepository');
const _PageRepository = require('./repositories/pageRepository');
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
  ],
  'showRoles': [],
  'showPages': []
}

queryhandler = async (query, user) => {

  if (!queries[query.name])
    throw errors.queryNotFound;

  try {
    let repo;
    switch (query.name) {
      case 'loginUser':
        const UserRepository = await _UserRepository.load(query.payload.username);
        repo = {UserRepository}

        break;
      case 'userCheck':
        const UserRepository = await _UserRepository.loadById(query.payload.id);
        repo = {UserRepository}
        break;
      case 'userIsValid':
        const UserRepository = await _UserRepository.loadById(user.id);
        repo = {UserRepository}
        break;
      case 'showRoles':
        const RoleReopository = await _RoleRepository.load();
        repo = {RoleReopository}

        break;
      case 'showPages':
        const PageRepository = await _PageRepository.load();
        repo = {PageRepository}

        break;
      case 'showUserAccessiblePages':
        const PageRepository = await _PageRepository.load();
        const UserRepository = await _UserRepository.loadById(user.id);
        rep = {PageRepository, UserRepository};
    }

    /**
     * all queries will be called sequentially one after each other
     * each query change state of user and passed it along with payload to next query 
     */
    return queries[query.name].length ? queries[query.name].reduce((x, y) => x.then(r => y(r, query.payload)), Promise.resolve(repo, query.payload)) : Promise.resolve(repo);
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
