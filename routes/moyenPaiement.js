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

router.post('/', authMiddleware, createMoyenPaiement);
router.post('/uploadLogo/:id', authMiddleware, upload.single('logo'), uploadLogo);
router.get('/', getAllMoyenPaiement);
router.get('/actifs', getAllDispoMoyenPaiement);
router.get('/:id', getMoyenPaiementById);
router.put('/:id/updateInfos', authMiddleware, updateMoyenPaiement);
router.delete('/:id', authMiddleware, deleteMoyenPaiement);
router.patch('/:id/toggleStatus', authMiddleware, toggleMoyenPaiementStatus);

module.exports = router;