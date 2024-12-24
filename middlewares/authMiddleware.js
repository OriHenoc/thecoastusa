const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' });
        } else if (err.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Token invalide.' });
        } else {
            res.status(500).json({ message: 'Erreur interne du serveur.' });
        }
    }
};

module.exports = authMiddleware;
