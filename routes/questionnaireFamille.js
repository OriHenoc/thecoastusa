const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getQuestionnaire
} = require('../controllers/questionnaireFamilleController');

const router = express.Router();

router.get('/getQuestionnaire/:id', getQuestionnaire);

module.exports = router;