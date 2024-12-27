const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createPaiement,
    uploadPreuve,
    getAllPaiement,
    getAllConfirmedPaiement,
    getPaiementById,
    confirmPaiementStatus
} = require('../controllers/paiementController');

const router = express.Router();
router.post('/', createPaiement);
router.post('/uploadPreuve/:id', upload.single('logo'), uploadPreuve);
router.get('/', getAllPaiement);
router.get('/confirmes', getAllConfirmedPaiement);
router.get('/:id', getPaiementById);
router.patch('/:id/confirmer', confirmPaiementStatus);

module.exports = router;