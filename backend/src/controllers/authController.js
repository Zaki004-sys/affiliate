const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateAffiliateCode = require('../utils/generateAffiliateCode');
const crypto = require('crypto');

// @desc    Inscription affiliate
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est deja utilise' });
    }

    // Generer un code affiliate unique
    let affiliateCode = generateAffiliateCode();
    let codeExists = await User.findOne({ affiliateCode });
    while (codeExists) {
      affiliateCode = generateAffiliateCode();
      codeExists = await User.findOne({ affiliateCode });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      city,
      role: 'affiliate',
      affiliateCode
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      affiliateCode: user.affiliateCode,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l inscription', error: error.message });
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        affiliateCode: user.affiliateCode,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// @desc    Profil utilisateur
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const userObj = user.toObject();

    if (user.role === 'affiliate') {
      const Commission = require('../models/Commission');
      const validatedCommissions = await Commission.find({ affiliate: user._id, status: 'validated' });
      const validatedAmount = validatedCommissions.reduce((sum, c) => sum + c.amount, 0);
      userObj.validatedCommissionsAmount = validatedAmount;
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recuperation du profil', error: error.message });
  }
};

// @desc    Mettre a jour le profil
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, city, bankInfo } = req.body;
    
    if (bankInfo && bankInfo.rib) {
      const rib = bankInfo.rib;
      if (!/^\d{24}$/.test(rib)) {
        return res.status(400).json({ message: 'Le RIB doit contenir exactement 24 chiffres.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, city, bankInfo },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise a jour', error: error.message });
  }
};

// @desc    Demande de reinitialisation du mot de passe
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouve avec cet email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Dans un vrai projet, envoyer un email ici
    res.json({ 
      message: 'Instructions envoyees par email',
      resetToken // En dev uniquement
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Reinitialiser le mot de passe
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expire' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Mot de passe reinitialise avec succes' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
