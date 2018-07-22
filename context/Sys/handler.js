
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
    let returnValue;
    switch (query.name) {

      case 'loginUser':
        returnValue = await UserRepository.load(query.payload.username, query.payload.password);
        break;
    }

    return queries[query.name](returnValue, query.payload);
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