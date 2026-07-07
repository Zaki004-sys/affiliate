const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  wholesalePrice: { type: Number, required: true },
  minQuantity: { type: Number, required: true, default: 10 },
  commissionType: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
  commissionValue: { type: Number, default: 10 }, // Pourcentage ou montant fixe
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
