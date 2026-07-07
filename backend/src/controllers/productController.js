const Product = require('../models/Product');

// @desc    Lister tous les produits (actifs pour public, tous pour admin)
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Removed the isActive filter so that inactive products are still returned 
    // to the public/affiliates but with an 'Inactive' visual status.

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recuperation des produits', error: error.message });
  }
};

// @desc    Obtenir un produit par ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Produit non trouve' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Creer un produit (admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, wholesalePrice, minQuantity, commissionType, commissionValue, category } = req.body;

    let image = '/uploads/products/default.jpg';
    let images = [];
    
    if (req.files && req.files.length > 0) {
      image = `/uploads/products/${req.files[0].filename}`;
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    } else if (req.file) { // Fallback if single upload was used
      image = `/uploads/products/${req.file.filename}`;
      images = [image];
    }

    const product = await Product.create({
      name,
      description,
      image,
      images,
      wholesalePrice,
      minQuantity,
      commissionType,
      commissionValue,
      category
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la creation du produit', error: error.message });
  }
};

// @desc    Modifier un produit (admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouve' });
    }

    const { name, description, wholesalePrice, minQuantity, commissionType, commissionValue, category, isActive } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.wholesalePrice = wholesalePrice || product.wholesalePrice;
    product.minQuantity = minQuantity || product.minQuantity;
    product.commissionType = commissionType || product.commissionType;
    product.commissionValue = commissionValue !== undefined ? commissionValue : product.commissionValue;
    product.category = category || product.category;
    if (isActive !== undefined) product.isActive = isActive;
    
    if (req.files && req.files.length > 0) {
      product.image = `/uploads/products/${req.files[0].filename}`;
      product.images = req.files.map(file => `/uploads/products/${file.filename}`);
    } else if (req.file) {
      product.image = `/uploads/products/${req.file.filename}`;
      product.images = [product.image];
    }
    
    product.updatedAt = Date.now();

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise a jour', error: error.message });
  }
};

// @desc    Supprimer un produit (admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouve' });
    }

    await product.deleteOne();
    res.json({ message: 'Produit supprime' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// @desc    Obtenir les categories
// @route   GET /api/products/categories/list
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
};

// @desc    Basculer le statut actif/inactif d'un produit
// @route   PUT /api/products/:id/toggle
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouve' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({ message: 'Statut du produit mis a jour', isActive: product.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise a jour du statut', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  toggleProductStatus
};
