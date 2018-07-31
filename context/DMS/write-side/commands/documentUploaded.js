module.exports = async (payload, user) => {
  const docRepo = require('../../repositories/documentRepository');
  let doc = await docRepo.createDocument();
  return doc.uploadDocument(payload.file_details, payload.context, payload.doc_type_id, user.id);
};