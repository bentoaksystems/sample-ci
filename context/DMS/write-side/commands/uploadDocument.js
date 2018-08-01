const BaseCommand = require('../../../../utils/base-command');

module.exports = class UploadDocument extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.file_details)
        throw new Error('File details is not passed to add document');

      const DocumentRepository = require('../../repositories/documentRepository');
      const docObj = new DocumentRepository();
      let doc = await docObj.findDocumentById();

      return super.execut(async () => {
        return doc.documentIsUploaded(payload.file_details, payload.context, payload.doc_type_id, user.id);
      });
    } catch (err) {
      throw err;
    }
  }
}
