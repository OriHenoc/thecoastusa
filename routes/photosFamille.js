const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createPhotosFamille,
    getAllPhotosFamille,
    getAllVisibledPhotosFamille,
    getPhotosFamilleById,
    getPhotosFamilleByUtilisateurID,
    deletePhotosFamille,
    togglePhotosFamilleStatus
} = require('../controllers/photosFamilleController');

const router = express.Router();

router.post('/', authMiddleware, createPhotosFamille);
router.get('/', getAllPhotosFamille);
router.get('/visibles', getAllVisibledPhotosFamille);
router.get('/:id', getPhotosFamilleById);
router.get('/famille/:id', getPhotosFamilleByUtilisateurID);
router.delete('/:id', authMiddleware, deletePhotosFamille);
router.patch('/:id/toggleStatus', authMiddleware, togglePhotosFamilleStatus);

module.exports = router;