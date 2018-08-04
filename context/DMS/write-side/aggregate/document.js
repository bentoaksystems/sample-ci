
class Document {

  constructor(doc) {
    this.id = doc ? doc.id : null;
    this.file_path = doc ? doc.file_path : null;
  }

  async documentIsUploaded(file, context, docTypeId, userId) {

    const DocumentRepository = require('../../repositories/documentRepository');
    const documentRepObj = new DocumentRepository();
    const tempFilePath = file.path.replace(/\\/g, '/');
    const path = tempFilePath.substr(tempFilePath.indexOf('public') + 'public'.length);

    return documentRepObj.uploadDocument(this.id, path, context, docTypeId, userId);
  }

  async documentsRemoved(ids) {
    if (!ids.length)
      return Promise.resolve();

    const DocumentRepository = require('../../repositories/documentRepository');
    const documentRepository = new DocumentRepository();

    return documentRepository.removeDocuments(ids);
  }

  async documentUpdated(file, context, docTypeId, userId) {
    const DocumentRepository = require('../../repositories/documentRepository');
    const documentRepObj = new DocumentRepository();

    const updatedDetails = {};

    if (file) {
      const tempFilePath = file.path.replace(/\\/g, '/');
      updatedDetails.file_path = tempFilePath.substr(tempFilePath.indexOf('public') + 'public'.length);
    }

    if (context)
      updatedDetails.context = context;

    if (docTypeId)
      updatedDetails.document_type_id = docTypeId;

    updatedDetails.user_id = userId;

    return documentRepObj.updateDocument(this.id, updatedDetails)
      .then(res => Promise.resolve(res.get({plain: true})));
  }
}

module.exports = Document;