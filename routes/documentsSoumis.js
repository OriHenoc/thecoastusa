const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    soumettreDocument,
    getAllDocumentsSoumis,
    getDocumentsSoumisByUtilisateur,
    annulerDocumentSoumis
} = require('../controllers/documentsSoumisController');

const router = express.Router();
router.post('/soumission', upload.single('document'), soumettreDocument);
router.get('/', getAllDocumentsSoumis);
router.get('/byUtilisateur/:id', getDocumentsSoumisByUtilisateur);
router.patch('/annulerDoc', annulerDocumentSoumis);

module.exports = router;