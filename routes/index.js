const express = require('express');
const router = express.Router();

const authRoute = require('./auth');
const paysRoute = require('./pays');
const etatRoute = require('./etat');
const familleRoute = require('./famille');
const filleRoute = require('./fille');
const langueRoute = require('./langue');
const photosFamilleRoute = require('./photosFamille');
const photosFilleRoute = require('./photosFille');

router.use('/auth', authRoute);
router.use('/pays', paysRoute);
router.use('/etat', etatRoute);
router.use('/famille', familleRoute);
router.use('/fille', filleRoute);
router.use('/langue', langueRoute);
router.use('/photosFamille', photosFamilleRoute);
router.use('/photosFille', photosFilleRoute);

module.exports = router;