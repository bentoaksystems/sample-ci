const Page = require('../../../infrastructure/db/models/page.model');
const IPage = require('../write-side/aggregates/page')


/**
 * QUERY RELATED REPOSITORIES:
 */


/** COMMAND RELATED REPOSITORIES:
 * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IPage())
 * e.g: IPage  = require ('../write-side/aggregates/page.js')
 * 
 * **/

getIPageById = async (id) => {

  if (!id)
    throw new Error('page id is not defined');

  const page = await Page.model().findOne({
    where: {
      id
    },
  })

  return new IPage(page.id, page.name)

}

module.exports = {
  getIPageById
}