const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

    Context[req.body.context].handler(req.body, req.user)
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(`-> `, err);
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
