const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createEtat,
    getAllEtat,
    getAllVisibledEtat,
    getEtatById,
    updateEtat,
    deleteEtat,
    toggleEtatStatus
} = require('../controllers/etatController');

const router = express.Router();

router.post('/', authMiddleware, createEtat);
router.get('/', getAllEtat);
router.get('/visibles', getAllVisibledEtat);
router.get('/:id', getEtatById);
router.put('/:id', authMiddleware, updateEtat);
router.delete('/:id', authMiddleware, deleteEtat);
router.patch('/:id/toggleStatus', authMiddleware, toggleEtatStatus);

module.exports = router;