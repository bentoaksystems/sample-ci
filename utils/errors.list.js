let queryNotFound = new Error('query not defined on this context');
queryNotFound.status = 403;

let commandNotFound = new Error('command not defined on this context');
commandNotFound.status = 403;

let noUser = new Error('User not found');
noUser.status = 404;

let noAction = new Error('Action not found');
noAction.status = 404;

let noRole = new Error('Role not found');
noRole.status = 404;

let incompleteData = new Error('The passed data is incompleted');
incompleteData.status = 404;

let noAccess = new Error('You have not access to this action');
noAccess.status = 403;

let payloadIsNotDefined = new Error('payload is not defined');
payloadIsNotDefined.status = 403;

let entityNotFound = new Error('Reqeusted entity is not found');
entityNotFound.status = 404;

module.exports = {
  queryNotFound,
  commandNotFound,
  noUser,
  noRole,
  noAction,
  incompleteData,
  noAccess,
  payloadIsNotDefined,
  entityNotFound
};
