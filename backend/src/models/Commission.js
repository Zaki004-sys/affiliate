const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'validated', 'rejected', 'paid'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  validatedAt: { type: Date },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Commission', commissionSchema);
