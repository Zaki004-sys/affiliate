const Commission = require('../models/Commission');
const Lead = require('../models/Lead');

// @desc    Lister les commissions
// @route   GET /api/commissions
const getCommissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'affiliate') {
      query.affiliate = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.affiliate && req.user.role === 'admin') {
      query.affiliate = req.query.affiliate;
    }

    const commissions = await Commission.find(query)
      .populate('affiliate', 'firstName lastName email affiliateCode')
      .populate('lead', 'clientName clientPhone clientCity quantity status')
      .populate('product', 'name image wholesalePrice')
      .populate('validatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Valider une commission (admin)
// @route   PUT /api/commissions/:id/validate
const validateCommission = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ message: 'Commission non trouvee' });
    }

    commission.status = 'validated';
    commission.validatedAt = Date.now();
    commission.validatedBy = req.user._id;
    await commission.save();

    // Mettre a jour le lead aussi
    await Lead.findByIdAndUpdate(commission.lead, { status: 'converted' });

    res.json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Rejeter une commission (admin)
// @route   PUT /api/commissions/:id/reject
const rejectCommission = async (req, res) => {
  try {
    const { reason } = req.body;
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ message: 'Commission non trouvee' });
    }

    commission.status = 'rejected';
    commission.rejectionReason = reason || 'Non specifie';
    await commission.save();

    res.json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Marquer une commission comme payée (admin)
// @route   PUT /api/commissions/:id/pay
const markAsPaid = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);
    if (!commission) {
      return res.status(404).json({ message: 'Commission non trouvée' });
    }
    if (commission.status !== 'validated') {
      return res.status(400).json({ message: 'La commission doit être validée pour être payée' });
    }
    commission.status = 'paid';
    commission.paidAt = Date.now();
    await commission.save();
    res.json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Statistiques des commissions
// @route   GET /api/commissions/stats
const getCommissionStats = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'affiliate') {
      matchQuery.affiliate = req.user._id;
    }

    const totalPending = await Commission.countDocuments({ ...matchQuery, status: 'pending' });
    const totalValidated = await Commission.countDocuments({ ...matchQuery, status: 'validated' });
    const totalRejected = await Commission.countDocuments({ ...matchQuery, status: 'rejected' });

    const totalAmount = await Commission.aggregate([
      { $match: { ...matchQuery, status: 'validated' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingAmount = await Commission.aggregate([
      { $match: { ...matchQuery, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyStats = await Commission.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { 
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const totalPaid = await Commission.countDocuments({ ...matchQuery, status: 'paid' });

    const paidAmount = await Commission.aggregate([
      { $match: { ...matchQuery, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      pending: { count: totalPending, amount: pendingAmount[0]?.total || 0 },
      validated: { count: totalValidated, amount: totalAmount[0]?.total || 0 },
      rejected: { count: totalRejected, amount: 0 },
      paid: { count: totalPaid, amount: paidAmount[0]?.total || 0 },
      monthly: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { getCommissions, validateCommission, rejectCommission, getCommissionStats, markAsPaid };
