const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    submitReponses,
    getAllReponses,
    getReponsesByUtilisateur,
    getReponsesByQuestionnaire
} = require('../controllers/reponseController');

const router = express.Router();


router.post('/', submitReponses);
router.get('/', getAllReponses);
router.get('/byUtilisateur/:id', getReponsesByUtilisateur);
router.get('/byQuestionnaire/:id', getReponsesByQuestionnaire);

module.exports = router;