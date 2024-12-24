const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createFille,
    getAllFille,
    getAllVisibledFille,
    getFilleById,
    updateFille,
    deleteFille,
    toggleFilleStatus
} = require('../controllers/filleController');

const router = express.Router();

router.post('/', authMiddleware, createFille);
router.get('/', getAllFille);
router.get('/visibles', getAllVisibledFille);
router.get('/:id', getFilleById);
router.put('/:id', authMiddleware, updateFille);
router.delete('/:id', authMiddleware, deleteFille);
router.patch('/:id/toggleStatus', authMiddleware, toggleFilleStatus);

module.exports = router;