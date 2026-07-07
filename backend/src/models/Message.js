const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['admin', 'affiliate'], required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  messageType: { type: String, enum: ['text', 'image', 'payment'], default: 'text' },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
