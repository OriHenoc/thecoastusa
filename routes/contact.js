const express = require('express');
const { contacter } = require('../controllers/contactController');

const router = express.Router();

router.post('/', contacter);

module.exports = router;