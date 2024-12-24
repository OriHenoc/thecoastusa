const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createLangue,
    getAllLangue,
    getAllVisibledLangue,
    getLangueById,
    updateLangue,
    deleteLangue,
    toggleLangueStatus
} = require('../controllers/langueController');

const router = express.Router();

router.post('/', authMiddleware, createLangue);
router.get('/', getAllLangue);
router.get('/visibles', getAllVisibledLangue);
router.get('/:id', getLangueById);
router.put('/:id', authMiddleware, updateLangue);
router.delete('/:id', authMiddleware, deleteLangue);
router.patch('/:id/toggleStatus', authMiddleware, toggleLangueStatus);

module.exports = router;