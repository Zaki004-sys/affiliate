const User = require('../models/User');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const Commission = require('../models/Commission');
const Click = require('../models/Click');

// @desc    Dashboard Admin
// @route   GET /api/dashboard/admin
const getAdminDashboard = async (req, res) => {
  try {
    const totalAffiliates = await User.countDocuments({ role: 'affiliate' });
    const activeAffiliates = await User.countDocuments({ role: 'affiliate', isActive: true });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });

    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    // Calcul du chiffre d'affaires (Revenue)
    const convertedLeadsData = await Lead.find({ status: 'converted' }).populate('product', 'wholesalePrice');
    let totalRevenue = 0;
    convertedLeadsData.forEach(lead => {
      if (lead.product && lead.product.wholesalePrice) {
        totalRevenue += lead.quantity * lead.product.wholesalePrice;
      }
    });

    const totalClicks = await Click.countDocuments();

    const commissionStats = await Commission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyLeads = await Lead.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const topAffiliates = await Commission.aggregate([
      { $match: { status: 'validated' } },
      {
        $group: {
          _id: '$affiliate',
          totalEarnings: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'affiliate'
        }
      },
      { $unwind: '$affiliate' },
      {
        $project: {
          firstName: '$affiliate.firstName',
          lastName: '$affiliate.lastName',
          email: '$affiliate.email',
          totalEarnings: 1,
          count: 1
        }
      }
    ]);

    res.json({
      affiliates: { total: totalAffiliates, active: activeAffiliates },
      products: { total: totalProducts, active: activeProducts },
      leads: { total: totalLeads, new: newLeads, converted: convertedLeads },
      clicks: totalClicks,
      revenue: totalRevenue,
      commissions: commissionStats,
      monthlyLeads,
      topAffiliates
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Dashboard Affiliate
// @route   GET /api/dashboard/affiliate
const getAffiliateDashboard = async (req, res) => {
  try {
    const affiliateId = req.user._id;

    const totalClicks = await Click.countDocuments({ affiliate: affiliateId });
    const totalLeads = await Lead.countDocuments({ affiliate: affiliateId });
    const convertedLeads = await Lead.countDocuments({ affiliate: affiliateId, status: 'converted' });

    const commissions = await Commission.find({ affiliate: affiliateId });
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    const validatedCommissions = commissions.filter(c => c.status === 'validated');

    const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    const validatedAmount = validatedCommissions.reduce((sum, c) => sum + c.amount, 0);

    const monthlyClicks = await Click.aggregate([
      { $match: { affiliate: affiliateId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const monthlyCommissions = await Commission.aggregate([
      { $match: { affiliate: affiliateId, status: 'validated' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const recentLeads = await Lead.find({ affiliate: affiliateId })
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      clicks: { total: totalClicks, monthly: monthlyClicks },
      leads: { total: totalLeads, converted: convertedLeads, recent: recentLeads },
      commissions: {
        pending: { count: pendingCommissions.length, amount: pendingAmount },
        validated: { count: validatedCommissions.length, amount: validatedAmount }
      },
      monthlyCommissions,
      conversionRate: totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { getAdminDashboard, getAffiliateDashboard };
