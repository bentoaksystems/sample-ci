const express = require('express');
const router = express.Router();
const passport = require('passport');
const errors = require('../../utils/errors.list');
const db = require('../../infrastructure/db')


router.get('/ready', async (req, res) => {

  await db.isReady(true);
  res.status(200).json('server is fully up and running');

});

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
