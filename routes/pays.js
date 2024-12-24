const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createPays,
    getAllPays,
    getAllVisibledPays,
    getPaysById,
    updatePays,
    deletePays,
    togglePaysStatus
} = require('../controllers/paysController');

const router = express.Router();

router.post('/', authMiddleware, createPays);
router.get('/', getAllPays);
router.get('/visibles', getAllVisibledPays);
router.get('/:id', getPaysById);
router.put('/:id', authMiddleware, updatePays);
router.delete('/:id', authMiddleware, deletePays);
router.patch('/:id/toggleStatus', authMiddleware, togglePaysStatus);

module.exports = router;