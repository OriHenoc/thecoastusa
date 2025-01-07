const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createQuestionnaire,
    getAllQuestionnaire,
    getQuestionnaireById,
    getQuestionnairesByCategory,
    updateQuestionnaire,
    addQuestionToQuestionnaire,
    removeQuestionFromQuestionnaire,
    deleteQuestionnaire
} = require('../controllers/questionnaireController');

const router = express.Router();

// Routes spécifiques
router.post('/addQuestion', addQuestionToQuestionnaire);
router.post('/removeQuestion', removeQuestionFromQuestionnaire);
router.get('/categorie/:categorie', getQuestionnairesByCategory);

// Routes générales
router.post('/', createQuestionnaire);
router.get('/', getAllQuestionnaire);
router.put('/:id', authMiddleware, updateQuestionnaire);
router.delete('/:id', authMiddleware, deleteQuestionnaire);
router.post('/:id', getQuestionnaireById);

module.exports = router;