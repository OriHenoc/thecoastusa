const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createPhotosFille,
    getAllPhotosFille,
    getAllVisibledPhotosFille,
    getPhotosFilleById,
    deletePhotosFille,
    togglePhotosFilleStatus
} = require('../controllers/photosFilleController');

const router = express.Router();

router.post('/', authMiddleware, createPhotosFille);
router.get('/', getAllPhotosFille);
router.get('/visibles', getAllVisibledPhotosFille);
router.get('/:id', getPhotosFilleById);
router.delete('/:id', authMiddleware, deletePhotosFille);
router.patch('/:id/toggleStatus', authMiddleware, togglePhotosFilleStatus);

module.exports = router;