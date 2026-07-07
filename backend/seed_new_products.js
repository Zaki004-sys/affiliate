const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/affiliate_wholesale')
  .then(async () => {
    console.log('MongoDB connecte pour le seed');
    
    const products = [
      {
        name: "Ventilateur double tête pour voiture",
        description: "Ventilateur de voiture à double tête réglable (12V/24V) avec affichage numérique de la température. Idéal pour rafraîchir l'habitacle en été.",
        image: "https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?auto=format&fit=crop&q=80&w=800",
        wholesalePrice: 30,
        minQuantity: 5,
        commissionType: 'fixed',
        commissionValue: 3,
        category: 'Accessoires Auto',
        isActive: true
      },
      {
        name: "Ventilateur de plafond LED avec télécommande",
        description: "Ventilateur de plafond moderne avec éclairage LED intégré (culot E27). Contrôlez la vitesse du vent et la température de couleur via la télécommande incluse.",
        image: "https://images.unsplash.com/photo-1563820246221-5fbb798c87de?auto=format&fit=crop&q=80&w=800",
        wholesalePrice: 35,
        minQuantity: 5,
        commissionType: 'fixed',
        commissionValue: 4,
        category: 'Maison & Déco',
        isActive: true
      }
    ];

    await Product.insertMany(products);
    console.log('Produits ajoutés avec succès !');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
