class Document {

  constructor(doc) {
    this.id = doc ? doc.id : null;
    this.file_path = doc ? doc.file_path : null;
  }

  async uploadDocument(file, context, docTypeId, userId) {
    const DocumentRepository = require('../../repositories/documentRepository');

    const tempFilePath = file.path.replace(/\\/g, '/');
    const path = tempFilePath.substr(tempFilePath.indexOf('public') + 'public'.length);

    return DocumentRepository.uploadDocument(this.id, path, context, docTypeId, userId);
  }
}

module.exports = Document;