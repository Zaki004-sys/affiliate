const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/affiliate_wholesale')
  .then(() => console.log('MongoDB connecte'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/affiliates', require('./src/routes/affiliates'));
app.use('/api/leads', require('./src/routes/leads'));
app.use('/api/commissions', require('./src/routes/commissions'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/chat', require('./src/routes/chat'));

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API Grossiste Affiliation - OK' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur demarre sur le port ${PORT}`);
});

// Restart triggered
