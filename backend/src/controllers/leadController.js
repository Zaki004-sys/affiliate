const Lead = require('../models/Lead');
const Product = require('../models/Product');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const User = require('../models/User');

// @desc    Creer un lead (depuis un lien affiliate)
// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const { ref, productId, clientName, clientPhone, clientCity, quantity } = req.body;

    // Trouver l'affilie par son code
    const affiliate = await User.findOne({ affiliateCode: ref, role: 'affiliate' });
    if (!affiliate) {
      return res.status(404).json({ message: 'Code affiliate invalide' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouve' });
    }

    if (quantity < product.minQuantity) {
      return res.status(400).json({ 
        message: `La quantite minimale pour ce produit est de ${product.minQuantity} unites` 
      });
    }

    const lead = await Lead.create({
      affiliate: affiliate._id,
      product: productId,
      clientName,
      clientPhone,
      clientCity,
      quantity,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Calculer la commission
    let commissionAmount = 0;
    if (product.commissionType === 'percentage') {
      commissionAmount = (product.wholesalePrice * quantity * product.commissionValue) / 100;
    } else {
      commissionAmount = product.commissionValue * quantity;
    }

    // Creer la commission en attente
    await Commission.create({
      affiliate: affiliate._id,
      lead: lead._id,
      product: productId,
      amount: commissionAmount,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Demande envoyee avec succes',
      lead: await Lead.findById(lead._id).populate('product', 'name image')
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la creation du lead', error: error.message });
  }
};

// @desc    Enregistrer un clic sur un lien affiliate
// @route   POST /api/leads/click
const trackClick = async (req, res) => {
  try {
    const { ref, productId } = req.body;

    const affiliate = await User.findOne({ affiliateCode: ref, role: 'affiliate' });
    if (!affiliate) {
      return res.status(404).json({ message: 'Code affiliate invalide' });
    }

    await Click.create({
      affiliate: affiliate._id,
      product: productId || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer
    });

    res.json({ message: 'Clic enregistre' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Lister les leads (admin voit tout, affiliate voit les siens)
// @route   GET /api/leads
const getLeads = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'affiliate') {
      query.affiliate = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('affiliate', 'firstName lastName email affiliateCode')
      .populate('product', 'name image wholesalePrice')
      .sort({ createdAt: -1 });

    // Filtrer les leads dont la commission a été payée
    const leadIds = leads.map(l => l._id);
    const paidCommissions = await Commission.find({ lead: { $in: leadIds }, status: 'paid' }).select('lead');
    const paidLeadIds = paidCommissions.map(c => c.lead.toString());

    const activeLeads = leads.filter(l => !paidLeadIds.includes(l._id.toString()));

    res.json(activeLeads);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Mettre a jour le statut d'un lead (admin)
// @route   PUT /api/leads/:id/status
const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const lead = await Lead.findById(req.params.id).populate('product');

    if (!lead) {
      return res.status(404).json({ message: 'Lead non trouve' });
    }

    lead.status = status || lead.status;
    if (notes) lead.notes = notes;
    lead.updatedAt = Date.now();

    await lead.save();

    // ✅ CONVERTI : valider la commission automatiquement
    if (status === 'converted') {
      const commission = await Commission.findOne({ lead: lead._id });
      if (commission) {
        commission.status = 'validated';
        commission.validatedAt = Date.now();
        commission.validatedBy = req.user._id;
        await commission.save();
      } else {
        // Si la commission n'existe pas encore, la créer et la valider directement
        const product = lead.product;
        let commissionAmount = 0;
        if (product.commissionType === 'percentage') {
          commissionAmount = (product.wholesalePrice * lead.quantity * product.commissionValue) / 100;
        } else {
          commissionAmount = product.commissionValue * lead.quantity;
        }
        await Commission.create({
          affiliate: lead.affiliate,
          lead: lead._id,
          product: lead.product._id,
          amount: commissionAmount,
          status: 'validated',
          validatedAt: Date.now(),
          validatedBy: req.user._id
        });
      }
    }

    // ❌ ANNULÉ PAR LE CLIENT : supprimer la commission
    if (status === 'cancelled') {
      await Commission.deleteOne({ lead: lead._id });
    }

    // ❌ PERDU : rejeter la commission
    if (status === 'lost') {
      await Commission.updateOne(
        { lead: lead._id },
        { status: 'rejected', rejectionReason: 'Lead perdu' }
      );
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Obtenir les stats des leads pour un affiliate
// @route   GET /api/leads/stats
const getLeadStats = async (req, res) => {
  try {
    const affiliateId = req.user.role === 'affiliate' ? req.user._id : req.query.affiliateId;

    const totalLeads = await Lead.countDocuments({ affiliate: affiliateId });
    const convertedLeads = await Lead.countDocuments({ affiliate: affiliateId, status: 'converted' });
    const newLeads = await Lead.countDocuments({ affiliate: affiliateId, status: 'new' });

    const leadsByMonth = await Lead.aggregate([
      { $match: { affiliate: affiliateId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total: totalLeads,
      converted: convertedLeads,
      new: newLeads,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0,
      byMonth: leadsByMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { createLead, trackClick, getLeads, updateLeadStatus, getLeadStats };
