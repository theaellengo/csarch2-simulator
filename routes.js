const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const controller = require('./controller.js');
const bodyparser = require('body-parser');

router.use(bodyparser.urlencoded({ extended: false }));

router.get('/', (req, res) => {
  controller.getmain(req, res);
});

router.post('/', (req, res) => {
  controller.getinput(req, res);
});

module.exports = router;
