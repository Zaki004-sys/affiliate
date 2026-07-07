const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Admin : démarrer ou obtenir une conversation avec un affilié
// @route   POST /api/chat/conversations
const startConversation = async (req, res) => {
  try {
    let affiliateId;
    let adminId;

    if (req.user.role === 'admin') {
      affiliateId = req.body.affiliateId;
      adminId = req.user._id;
      const affiliate = await User.findById(affiliateId);
      if (!affiliate || affiliate.role !== 'affiliate') {
        return res.status(404).json({ message: 'Affilié non trouvé' });
      }
    } else {
      affiliateId = req.user._id;
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        return res.status(404).json({ message: 'Administrateur non trouvé' });
      }
      adminId = admin._id;
    }

    // Chercher une conversation existante
    let conversation = await Conversation.findOne({ affiliate: affiliateId, admin: adminId })
      .populate('affiliate', 'firstName lastName email affiliateCode bankInfo')
      .populate('admin', 'firstName lastName email');

    if (!conversation) {
      conversation = await Conversation.create({
        affiliate: affiliateId,
        admin: adminId,
        lastMessage: '',
        lastMessageAt: Date.now()
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('affiliate', 'firstName lastName email affiliateCode bankInfo')
        .populate('admin', 'firstName lastName email');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Lister toutes les conversations (admin) ou ma conversation (affilié)
// @route   GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    let conversations;

    if (req.user.role === 'admin') {
      conversations = await Conversation.find()
        .populate('affiliate', 'firstName lastName email affiliateCode phone city bankInfo')
        .populate('admin', 'firstName lastName email')
        .sort({ lastMessageAt: -1 });
    } else {
      conversations = await Conversation.find({ affiliate: req.user._id })
        .populate('affiliate', 'firstName lastName email affiliateCode bankInfo')
        .populate('admin', 'firstName lastName email')
        .sort({ lastMessageAt: -1 });
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/chat/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier accès
    if (req.user.role === 'affiliate' && conversation.affiliate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'firstName lastName role')
      .sort({ createdAt: 1 });

    // Marquer comme lu
    if (req.user.role === 'affiliate') {
      await Conversation.findByIdAndUpdate(req.params.id, { unreadByAffiliate: 0 });
    } else {
      await Conversation.findByIdAndUpdate(req.params.id, { unreadByAdmin: 0 });
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Envoyer un message
// @route   POST /api/chat/conversations/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { content, imageUrl, messageType } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Vérifier accès
    if (req.user.role === 'affiliate' && conversation.affiliate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (req.user.role === 'affiliate') {
      const Commission = require('../models/Commission');
      const validatedCommissions = await Commission.find({ affiliate: req.user._id, status: 'validated' });
      const validatedAmount = validatedCommissions.reduce((sum, c) => sum + c.amount, 0);
      
      if (validatedAmount < 200) {
        return res.status(403).json({ message: 'Vous devez avoir au moins 200 DH de gains (À Payer) pour contacter l\'administrateur.' });
      }
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      senderRole: req.user.role,
      content: content || '',
      imageUrl: req.file ? `/uploads/chat/${req.file.filename}` : (imageUrl || null),
      messageType: req.file ? 'image' : (messageType || 'text')
    });

    // Mettre à jour la conversation
    const updateData = {
      lastMessage: content,
      lastMessageAt: Date.now()
    };
    if (req.user.role === 'admin') {
      updateData.unreadByAffiliate = (conversation.unreadByAffiliate || 0) + 1;
    } else {
      updateData.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
    }

    await Conversation.findByIdAndUpdate(req.params.id, updateData);

    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

module.exports = { startConversation, getConversations, getMessages, sendMessage };
