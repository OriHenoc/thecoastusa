const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    soumettrePaiement,
} = require('../controllers/paiementController');

const router = express.Router();

router.post('/soumission', upload.single('preuve'), soumettrePaiement);

module.exports = router;