const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, toggleProductStatus } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.put('/:id/toggle', protect, adminOnly, toggleProductStatus);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
