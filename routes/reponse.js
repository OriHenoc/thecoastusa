const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    submitReponses,
    getReponsesByUtilisateur
} = require('../controllers/reponseController');

const router = express.Router();


router.post('/', submitReponses);
router.get('/:id', getReponsesByUtilisateur);

module.exports = router;