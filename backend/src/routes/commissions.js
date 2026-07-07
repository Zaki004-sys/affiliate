const express = require('express');
const router = express.Router();
const { getCommissions, validateCommission, rejectCommission, getCommissionStats, markAsPaid } = require('../controllers/commissionController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getCommissions);
router.get('/stats', protect, getCommissionStats);
router.put('/:id/validate', protect, adminOnly, validateCommission);
router.put('/:id/reject', protect, adminOnly, rejectCommission);
router.put('/:id/pay', protect, adminOnly, markAsPaid);

module.exports = router;
