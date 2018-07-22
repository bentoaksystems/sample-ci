let queryNotFound = new Error("query not defined on this context");
queryNotFound.status = 403;


module.exports = {
  queryNotFound
}
