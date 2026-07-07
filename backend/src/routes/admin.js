const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Creer un admin (a utiliser une seule fois)
// @route   POST /api/admin/setup
router.post('/setup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Un admin existe deja' });
    }

    const admin = await User.create({
      firstName: firstName || 'Admin',
      lastName: lastName || 'System',
      email,
      password,
      phone: '0000000000',
      city: 'System',
      role: 'admin'
    });

    res.status(201).json({ message: 'Admin cree avec succes', admin: { email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

module.exports = router;
