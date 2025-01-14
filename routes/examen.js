const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    getAllExamen,
    getExamenById,
    getExamenByUtilisateurID,
    updateExamen,
    deleteExamen,
    validerExamen,
    annulerExamen
} = require('../controllers/examenController');

const router = express.Router();

router.get('/byUtilisateur/:id', getExamenByUtilisateurID);
router.put('/:id/updateExamen', updateExamen);

router.patch('/valider/:id', validerExamen);
router.patch('/annuler/:id', annulerExamen);

router.get('/', getAllExamen);
router.get('/:id', getExamenById);
router.delete('/:id', deleteExamen);

module.exports = router;