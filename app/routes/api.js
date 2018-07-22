const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Context = require('../../context');

function apiResponse() {
  return (function (req, res) {
    const isCommand = req.body.is_command;
    const context = req.body.context;
    const name = req.body.name;
    const body = req.body.body;

    // Check access
    // Context.Sys.CommandHandler.

    Context[context]['handler'][name](body, req.user)
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
