const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    soumettrePaiement,
    getAllPaiement,
    getAllConfirmedPaiement,
    getPaiementById,
    confirmPaiementStatus
} = require('../controllers/paiementController');

const router = express.Router();
router.post('/soumission', upload.single('preuve'), soumettrePaiement);
router.get('/', getAllPaiement);
router.get('/confirmes', getAllConfirmedPaiement);
router.get('/:id', getPaiementById);
router.patch('/:id/confirmer', confirmPaiementStatus);

module.exports = router;