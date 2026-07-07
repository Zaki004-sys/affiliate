const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/affiliate_wholesale');
    console.log('MongoDB connecte pour le seeding');

    // Nettoyer les collections
    await User.deleteMany({});
    await Product.deleteMany({});

    // Creer un admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Grossiste',
      email: 'admin@grossiste.com',
      password: 'admin123',
      phone: '0612345678',
      city: 'Casablanca',
      role: 'admin'
    });
    console.log('Admin cree:', admin.email);

    // Creer des produits de demo
    const products = [
      {
        name: 'T-shirts en coton bio - Lot de 50',
        description: 'T-shirts 100% coton biologique, disponibles en plusieurs tailles (S, M, L, XL). Qualite premium pour revendeurs.',
        image: '/uploads/products/tshirts.jpg',
        wholesalePrice: 2500,
        minQuantity: 50,
        commissionType: 'percentage',
        commissionValue: 8,
        category: 'Textile'
      },
      {
        name: 'Sneakers sport - Lot de 30 paires',
        description: 'Sneakers tendance pour hommes et femmes. Design moderne, semelle confortable. Parfait pour les boutiques de sport.',
        image: '/uploads/products/sneakers.jpg',
        wholesalePrice: 8500,
        minQuantity: 30,
        commissionType: 'percentage',
        commissionValue: 10,
        category: 'Chaussures'
      },
      {
        name: 'Montres elegantes - Lot de 20',
        description: 'Montres analogiques avec bracelet en cuir veritable. Mouvement quartz japonais. Ideal pour les bijouteries.',
        image: '/uploads/products/montres.jpg',
        wholesalePrice: 6000,
        minQuantity: 20,
        commissionType: 'fixed',
        commissionValue: 150,
        category: 'Accessoires'
      },
      {
        name: 'Sacs a main cuir - Lot de 25',
        description: 'Sacs a main en cuir synthetique haute qualite. Plusieurs coloris disponibles. Design elegant et durable.',
        image: '/uploads/products/sacs.jpg',
        wholesalePrice: 7500,
        minQuantity: 25,
        commissionType: 'percentage',
        commissionValue: 12,
        category: 'Maroquinerie'
      },
      {
        name: 'Ecouteurs Bluetooth - Lot de 100',
        description: 'Ecouteurs sans fil Bluetooth 5.0 avec etui de charge. Autonomie 24h. Compatible iOS et Android.',
        image: '/uploads/products/ecouteurs.jpg',
        wholesalePrice: 12000,
        minQuantity: 100,
        commissionType: 'percentage',
        commissionValue: 5,
        category: 'Electronique'
      },
      {
        name: 'Bouteilles isothermes - Lot de 60',
        description: 'Bouteilles en inox double paroi, maintient les boissons chaudes 12h et froides 24h. Design ergonomique.',
        image: '/uploads/products/bouteilles.jpg',
        wholesalePrice: 4200,
        minQuantity: 60,
        commissionType: 'fixed',
        commissionValue: 50,
        category: 'Maison'
      }
    ];

    await Product.insertMany(products);
    console.log(`${products.length} produits crees`);

    console.log('\nSeeding termine avec succes!');
    console.log('\nCompte admin:');
    console.log('Email: admin@grossiste.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedData();
