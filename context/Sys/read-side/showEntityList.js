const tableList = require('../../../infrastructure/db').tableList;

module.exports = async () => {
  try {
    if (!tableList || !tableList.length)
      return Promise.reject(errors.noTable);

    let tableListName = [];
    tableList.forEach( el => tableListName.push( el.model().tableName));
    return Promise.resolve({
      tableListName,
    });

  } catch (err) {
    throw err;
  }
}