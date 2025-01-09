const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getQuestionnaire,
    getAllQuestionnaireFille
} = require('../controllers/questionnaireFilleController');

const router = express.Router();

router.get('/getQuestionnaire/:id', getQuestionnaire);
router.get('/', getAllQuestionnaireFille)

module.exports = router;