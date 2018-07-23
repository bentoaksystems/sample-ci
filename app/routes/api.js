const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Context = require('../../context');
const authHandler = require('../passport/authHandler');

function apiResponse() {
  return (function (req, res) {
    // Check access
    // Context.Sys.CommandHandler.

    Context[req.body.context](req.body, req.user)
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(`Error in  ${context} context in ${isCommand ? 'CommandHandler' : 'QueryHandler'}: `, err);
        res.status(err.status || 500).send(err.message || err);
      });
  });
}

// General APIs (except authentication)
router.use('/uploading', function (req, res, next) {

});
router.post('/uploading', apiResponse());

router.post('/', apiResponse());

// Authentication APIs
router.post('/login', passport.authenticate('local', {}));
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json('');
});

module.exports = router;
