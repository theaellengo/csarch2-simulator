const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const controller = require('./controller.js');

router.get('/', (req, res) => {
  controller.getmain(req, res);
});

router.post(
  '/',
  [
    check('inputFloat', 'This field is required.').not().isEmpty(),
    check('inputFloat', 'Please enter a number.').isNumeric(),
    check('inputExp', 'This field is required').not().isEmpty(),
    check('inputExp', 'Please enter a whole number.').isInt()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array });
    }
    res.send('index');
  }
);

module.exports = router;
