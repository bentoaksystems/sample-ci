const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


function apiResponse() {
  return (function (req, res) {
    const isCommand = req.body.is_command;
    const context = req.body.context;
    const name = req.body.name;
    const body = req.body.body;

    // Check access 
  });
}

router.use('/image', function (req, res, next) {

});
router.post('/image', apiResponse());

router.post('/', apiResponse());

module.exports = router;
