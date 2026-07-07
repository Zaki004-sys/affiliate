const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://affiliate-tawny-two.vercel.app',
    'https://affiliate-3wk2.vercel.app',
    /\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
const isVercel = process.env.VERCEL === '1';
const baseDir = isVercel ? require('os').tmpdir() : __dirname;
app.use('/uploads', express.static(path.join(baseDir, 'uploads')));

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

// Route temporaire pour peupler la base de donnees (seeding) depuis Vercel
app.get('/api/run-seed-now', async (req, res) => {
  try {
    const User = require('./src/models/User');
    const Product = require('./src/models/Product');
    
    await User.deleteMany({});
    await Product.deleteMany({});
    
    await User.create({
      firstName: 'Admin',
      lastName: 'Grossiste',
      email: 'admin@grossiste.com',
      password: 'admin123',
      phone: '0612345678',
      city: 'Casablanca',
      role: 'admin'
    });
    
    res.json({ success: true, message: "Base de donnees peuplee avec succes ! Vous pouvez vous connecter." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Pour le déploiement sur Vercel (Serverless)
module.exports = app;
