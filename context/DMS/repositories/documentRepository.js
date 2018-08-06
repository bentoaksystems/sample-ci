const Document = require('../../../infrastructure/db/models/document.model');
const IDocument = require('../write-side/aggregate/document');

module.exports = class DocumentRepository {
  constructor() {

  }

  /**
   * QUERY RELATED REPOSITORIES:
   */

  /** COMMAND RELATED REPOSITORIES:
   * If a domain model is being requested by repositoris it should be returnd as an instance of domain model (new IUser())
   * e.g: IUser  = require ('../write-side/aggregates/user.js')
   * 
   * **/

  async findDocumentById(id) {
    const doc = Document.model().findOne({where: {id}});

    if (id && !doc)
      throw new Error('The document with this id not found');

    return new IDocument(doc);
  }

  async uploadDocument(documentId, filePath, context, docTypeId, userId) {
    return Document.model().create(
      {
        user_id: userId,
        file_path: filePath,
        context: context,
        type_dictionary_id: docTypeId,
      }
    );
  }
}