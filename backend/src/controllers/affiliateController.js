const User = require('../models/User');
const Lead = require('../models/Lead');
const Commission = require('../models/Commission');
const Click = require('../models/Click');

// @desc    Lister tous les affiliates
// @route   GET /api/affiliates
const getAffiliates = async (req, res) => {
  try {
    const affiliates = await User.find({ role: 'affiliate' })
      .select('-password')
      .sort({ createdAt: -1 });

    const affiliatesWithStats = await Promise.all(affiliates.map(async (affiliate) => {
      const pendingPayment = await Commission.find({ affiliate: affiliate._id, status: 'validated' });
      const amountOwed = pendingPayment.reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = await Commission.aggregate([
        { $match: { affiliate: affiliate._id, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      return {
        ...affiliate.toObject(),
        stats: {
          totalEarnings: amountOwed,
          totalPaid: totalPaid[0]?.total || 0
        }
      };
    }));

    res.json(affiliatesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Obtenir un affiliate par ID
// @route   GET /api/affiliates/:id
const getAffiliateById = async (req, res) => {
  try {
    const affiliate = await User.findById(req.params.id).select('-password');
    if (!affiliate) {
      return res.status(404).json({ message: 'Affilie non trouve' });
    }

    // Stats
    const totalLeads = await Lead.countDocuments({ affiliate: affiliate._id });
    const totalClicks = await Click.countDocuments({ affiliate: affiliate._id });
    const commissions = await Commission.find({ affiliate: affiliate._id, status: 'validated' });
    const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      ...affiliate.toObject(),
      stats: {
        totalLeads,
        totalClicks,
        totalEarnings,
        conversionRate: totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Activer/Desactiver un affiliate
// @route   PUT /api/affiliates/:id/toggle
const toggleAffiliateStatus = async (req, res) => {
  try {
    const affiliate = await User.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affilie non trouve' });
    }

    affiliate.isActive = !affiliate.isActive;
    await affiliate.save();

    res.json({ message: `Affilie ${affiliate.isActive ? 'active' : 'desactive'}`, affiliate });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Obtenir les clics d'un affiliate
// @route   GET /api/affiliates/clicks
const getClicks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'affiliate') {
      query.affiliate = req.user._id;
    } else if (req.query.affiliateId) {
      query.affiliate = req.query.affiliateId;
    }

    const clicks = await Click.find(query)
      .populate('affiliate', 'firstName lastName affiliateCode')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const totalClicks = await Click.countDocuments(query);
    const uniqueIps = await Click.distinct('ipAddress', query);

    res.json({
      clicks,
      total: totalClicks,
      uniqueVisitors: uniqueIps.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};
// @desc    Supprimer un affiliate
// @route   DELETE /api/affiliates/:id
const deleteAffiliate = async (req, res) => {
  try {
    const affiliate = await User.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affilie non trouve' });
    }

    // Optionally: delete related records (leads, commissions, clicks) or just let them be orphaned
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Utilisateur supprime avec succes' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { getAffiliates, getAffiliateById, toggleAffiliateStatus, getClicks, deleteAffiliate };
