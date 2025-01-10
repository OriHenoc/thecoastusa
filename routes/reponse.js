const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    submitReponses,
    getAllReponses,
    getReponsesByUtilisateur,
    getReponsesByQuestionnaire,
    validerReponses,
    refuserReponses
} = require('../controllers/reponseController');

const router = express.Router();


router.post('/', submitReponses);
router.get('/', getAllReponses);
router.get('/byUtilisateur/:id', getReponsesByUtilisateur);
router.get('/byQuestionnaire/:id', getReponsesByQuestionnaire);
router.get('/valider/:id', validerReponses);
router.get('/refuser/:id', refuserReponses);

module.exports = router;