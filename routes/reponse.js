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
router.post('/valider/:id', validerReponses);
router.post('/refuser/:id', refuserReponses);

module.exports = router;