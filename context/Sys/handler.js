
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

  switch (query.name) {

    case 'loginUser':
      const user = await UserRepository.load(query.payload.username, query.payload.password);
      return queries[query.name];
      break;
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