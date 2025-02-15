const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getAllReponses,
    getReponsesByExamen,
    getReponsesByUtilisateur,
    refuserReponses,
    validerReponses
} = require('../controllers/repExamenController');

const router = express.Router();

router.get('/', getAllReponses);
router.get('/byUtilisateur/:id', getReponsesByUtilisateur);
router.get('/byExamen/:id', getReponsesByExamen);
router.patch('/valider/:id', validerReponses);
router.post('/refuser/:id', refuserReponses);

module.exports = router;