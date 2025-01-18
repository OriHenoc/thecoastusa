const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    putFavoris,
    getAllFavoris,
    getFavorisById,
    getFavorisByFilleId,
    getFavorisByFamilleId,
    deleteFavoris
} = require('../controllers/favorisController');

const router = express.Router();

router.get('/byFille/:id', getFavorisByFilleId);
router.get('/byFamille/:id', getFavorisByFamilleId);
router.delete('/:id', deleteFavoris);

router.post('/', putFavoris);
router.get('/', getAllFavoris);
router.get('/:id', getFavorisById);

module.exports = router;