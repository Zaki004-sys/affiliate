const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadByAffiliate: { type: Number, default: 0 },
  unreadByAdmin: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
