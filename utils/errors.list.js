let queryNotFound = new Error("query not defined on this context");
queryNotFound.status = 403;

let noUser = new Error('User not found');
noUser.status = 404;

let incompleteData = new Error('The passed data is incompleted');
incompleteData.status = 404;

let noAccess = new Error('You have not access to this action');
noAccess.status = 403;

module.exports = {
  queryNotFound,
  noUser,
  incompleteData,
  noAccess,
}
