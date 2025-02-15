const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createExamen,
    getAllExamen,
    getExamenById,
    getExamenByFormationID,
    getExamenByUtilisateurID,
    updateExamen,
    deleteExamen,
    getReponseByExamen,
    //annulerExamen,
    addQuestionToExamen,
    removeQuestionFromExamen,
    submitReponses
} = require('../controllers/examenController');

const router = express.Router();

router.post('/', createExamen);
router.post('/addQuestion', addQuestionToExamen);
router.post('/removeQuestion', removeQuestionFromExamen);
router.post('/soumettre', submitReponses);
router.get('/byUtilisateur/:id', getExamenByUtilisateurID);
router.get('/byFormation/:id', getExamenByFormationID);
router.get('/reponseByExamen/:id', getReponseByExamen);
router.put('/:id/updateExamen', updateExamen);

// router.patch('/valider/:id', validerExamen);
// router.patch('/annuler/:id', annulerExamen);

router.get('/', getAllExamen);
router.get('/:id', getExamenById);
router.delete('/:id', deleteExamen);

module.exports = router;