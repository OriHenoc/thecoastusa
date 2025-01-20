const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    soumettrePaiement,
    getAllPaiement,
    getAllConfirmedPaiement,
    getPaiementById,
    confirmPaiementStatus,
    refuserPaiement,
    getPaiementByUtilisateur
} = require('../controllers/paiementController');

const router = express.Router();
router.post('/soumission', upload.single('preuve'), soumettrePaiement);
router.get('/byUtilisateur/:id', getPaiementByUtilisateur);
router.get('/', getAllPaiement);
router.get('/confirmes', getAllConfirmedPaiement);
router.get('/:id', getPaiementById);
router.patch('/:id/confirmer', confirmPaiementStatus);
router.patch('/:id/refuser', refuserPaiement);

module.exports = router;