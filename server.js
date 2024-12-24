const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const allRoutes = require('./routes');
const path = require('path');
dotenv.config();
const app = express();
const cron = require('node-cron');

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors());
app.use('/api', allRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Test OKAY')
})

const start = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('La variable MONGODB_URI doit être définie');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log('Connecté à MongoDB !');
    } catch (err) {
        console.error('Erreur de connexion à MongoDB:', err);
        throw err;
    }

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Le serveur tourne sur le port ${port} !!!!!!!!!`);
    });
};

start();