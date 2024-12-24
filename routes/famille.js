const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createFamille,
    getAllFamille,
    getAllVisibledFamille,
    getFamilleById,
    updateFamille,
    deleteFamille,
    toggleFamilleStatus
} = require('../controllers/familleController');

const router = express.Router();

router.post('/', authMiddleware, createFamille);
router.get('/', getAllFamille);
router.get('/visibles', getAllVisibledFamille);
router.get('/:id', getFamilleById);
router.put('/:id', authMiddleware, updateFamille);
router.delete('/:id', authMiddleware, deleteFamille);
router.patch('/:id/toggleStatus', authMiddleware, toggleFamilleStatus);

module.exports = router;