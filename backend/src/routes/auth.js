const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('firstName').notEmpty().withMessage('Le prenom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caracteres'),
  body('phone').notEmpty().withMessage('Le telephone est requis'),
  body('city').notEmpty().withMessage('La ville est requise')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
], login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
