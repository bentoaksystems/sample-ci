let queryNotFound = new Error("query not defined on this context");
queryNotFound.status = 403;

let noUser = new Error('User not found');
noUser.status = 404;

module.exports = {
  queryNotFound,
  noUser,
}
