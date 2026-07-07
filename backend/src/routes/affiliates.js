const express = require('express');
const router = express.Router();
const { getAffiliates, getAffiliateById, toggleAffiliateStatus, getClicks, deleteAffiliate } = require('../controllers/affiliateController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAffiliates);
router.get('/clicks', protect, getClicks);
router.get('/:id', protect, adminOnly, getAffiliateById);
router.put('/:id/toggle', protect, adminOnly, toggleAffiliateStatus);
router.delete('/:id', protect, adminOnly, deleteAffiliate);

module.exports = router;
