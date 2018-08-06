const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const env = require('../../env');
const passport = require('passport');
const Context = require('../../context');
const authHandler = require('../passport/authHandler');
const errors = require('../../utils/errors.list');

function apiResponse() {
  return (function (req, res) {

    if (!req.user) {
      res.status(errors.noUser.status).send(errors.noUser.message);
      return;
    }

    new Context[req.body.context]().handler(req.body, req.user)
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(`-> Context: ${req.body.context} - HandlerName: ${req.body.name}`);
        console.log(`--> Err: `, err);
        res.status(err.status || 500).send(err.message || err);
      });
  });
}

// General APIs (except authentication)
router.use('/uploading', function (req, res, next) {
  try {
    let contextUploadPath = path.sep + (req.body.payload.doc_context || 'not_categorised') + path.sep;
    const destination = env.uploadDocumentPath + contextUploadPath;

    const documentStorage = multer.diskStorage({
      destination,
      filename: (req, file, cb) => {
        cb(null, (new Date().getTime()) + '-' + file.originalname);
      }
    });

    const documentUpload = multer({storage: documentStorage});
    let fileDetails;

    const uploadUpdatePayload = {
      id: req.body.payload.id,
      context: req.body.context,
      doc_type_id: req.body.payload.doc_type_id,
    };

    const body = Object.assign({}, req.body);

    documentUpload.single('file')(req, res, err => {
      if (err) {
        console.error('Error in uploading file: ', err);
        res.status(500)
          .send(err);
      } else {
        (new Context.DMS()).handler({
          is_command: true,
          name: body.context.toLowerCase() === 'dms' ? body.name : 'uploadDocument',
          payload: Object.assign(uploadUpdatePayload, {file_details: req.file}),
        }, req.user)
          .then(result => {
            req.body = body;
            req.body.payload.document_id = result.id;
            req.body.payload.file_path = result.file_path;

            if (req.body.context.toLowerCase() === 'dms') {
              result.document_id = result.id;
              delete result.id;
              res.status(200).json(result);
            } else
              next();
          })
          .catch(er => {
            console.error('--> Error in uploading/updating document: ', er);
            res.status(500)
              .send(er);
          });
      }
    });
  } catch (err) {
    console.log('--> Error in uploading: ', err);
    res.status(500).send(err);
  }
});
router.post('/uploading', apiResponse());

router.post('/', apiResponse());

// Authentication APIs
router.post('/login', passport.authenticate('local', {}), (req, res) => {
  if (!req.user)
    res.status(404).json(errors.noUser);
  else
    res.status(200).json(req.user);
});
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json('');
});

module.exports = router;
