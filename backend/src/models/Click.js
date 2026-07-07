const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  country: { type: String },
  city: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Click', clickSchema);
