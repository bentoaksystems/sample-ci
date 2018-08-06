const BaseCommand = require('../../../../utils/base-command');

module.exports = class UpdateDocument extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id)
        throw new Error("The target document's id is not passed");

      if (!payload.file_details)
        throw new Error("File details is not passed to add document");

      const DocumentRepository = require('../../repositories/documentRepository');
      const docObj = new DocumentRepository();
      let doc = await docObj.findOrCreateDocument(payload.id);

      return super.execut(async () => {
        return doc.documentUpdated(payload.file_details, payload.context, payload.doc_type_id, user.id);
      })
    } catch (err) {
      throw err;
    }
  }
}