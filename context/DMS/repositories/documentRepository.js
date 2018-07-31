const Document = require('../../../infrastructure/db/models/document.model');
const IDocument = require('../write-side/aggregate/document');

/**
 * QUERY RELATED REPOSITORIES:
 */




/** COMMAND RELATED REPOSITORIES:
* If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
* e.g: IUser  = require ('../write-side/aggregates/user.js')
* 
* **/

createDocument = async () => {
  let doc = Document.model().create();
  return new IDocument(doc);
}

uploadDocument = (documentId, filePath, context, docTypeId, userId) => {
  return Document.model().update(
    {
      user_id: userId,
      file_path: filePath,
      context: context,
      type_dictionary_id: docTypeId,
    },
    {
      where: {id: documentId}
    }
  );
}

module.exports = {
  createDocument,
  uploadDocument,
};
