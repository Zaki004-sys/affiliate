const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientCity: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['new', 'converted', 'cancelled', 'in_progress'], default: 'new' },
  notes: { type: String, default: '' },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
