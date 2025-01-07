const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createQuestion,
    getAllQuestion,
    getQuestionById,
    getQuestionsByType,
    updateQuestion,
    addOptionToQuestion,
    removeOptionFromQuestion,
    deleteQuestion
} = require('../controllers/questionController');

const router = express.Router();


router.post('/addOption', addOptionToQuestion);
router.post('/removeOption', removeOptionFromQuestion);
router.get('/type/:type', getQuestionsByType);

router.post('/', createQuestion);
router.get('/', getAllQuestion);
router.post('/:id', getQuestionById);
router.put('/:id', authMiddleware, updateQuestion);
router.delete('/:id', authMiddleware, deleteQuestion);

module.exports = router;