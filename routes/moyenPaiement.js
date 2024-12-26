const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createMoyenPaiement,
    uploadLogo,
    getAllMoyenPaiement,
    getAllDispoMoyenPaiement,
    updateMoyenPaiement,
    getMoyenPaiementById,
    deleteMoyenPaiement,
    toggleMoyenPaiementStatus
} = require('../controllers/moyenPaiementController');

const router = express.Router();

router.post('/', createMoyenPaiement);
router.post('/uploadLogo/:id', upload.single('logo'), uploadLogo);
router.get('/', getAllMoyenPaiement);
router.get('/disponibles', getAllDispoMoyenPaiement);
router.get('/:id', getMoyenPaiementById);
router.put('/:id/updateInfos', updateMoyenPaiement);
router.delete('/:id', deleteMoyenPaiement);
router.patch('/:id/toggleStatus', toggleMoyenPaiementStatus);

module.exports = router;