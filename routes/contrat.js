const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    getAllContrats,
    getContratByUtilisateurID,
    updateValidationStatus,
    // annulerContrat,
    // validerContrat,
    soumettreContrat
} = require('../controllers/contratController');

const router = express.Router();
router.post('/soumission', upload.single('contrat'), soumettreContrat)
router.get('/byUtilisateur/:id', getContratByUtilisateurID);
// router.patch('/annuler/:id', annulerContrat);
// router.patch('/valider/:id', validerContrat);
router.patch('/validation/:id/', updateValidationStatus);
router.get('/', getAllContrats);

module.exports = router;