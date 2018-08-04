const BaseCommand = require('../../../../utils/base-command');

module.exports = class RemoveDocument extends BaseCommand {
  constructor() {
    super();
  }

  async execut(payload, user) {
    try {
      if (!payload.id)
        throw new Error("Document's id is not passed");

      const DocumentRepository = require('../../repositories/documentRepository');
      const docObj = new DocumentRepository();
      let doc = await docObj.findOrCreateDocument();

      return super.execut(async () => {
        return doc.documentsRemoved([payload.id]);
      });
    } catch (err) {
      throw err;
    }
  }
}