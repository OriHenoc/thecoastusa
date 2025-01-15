const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getQuestionnaire,
    getAllQuestionnaireFamille
} = require('../controllers/questionnaireFamilleController');

const router = express.Router();

router.get('/getQuestionnaire/:id', getQuestionnaire);
router.get('/', getAllQuestionnaireFamille)

module.exports = router;