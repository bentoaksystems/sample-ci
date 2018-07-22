const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Context = require('../../context');

function apiResponse() {
  return (function (req, res) {
    // Check access
    // Context.Sys.CommandHandler.

    Context[context]['handler'](req.body, req.user)
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
router.use('/image', function (req, res, next) {

});
router.post('/image', apiResponse());

router.post('/', apiResponse());

// Authentication APIs
router.post('/login', passport.authenticate('local', {}), apiResponse());
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json('');
});

module.exports = router;
