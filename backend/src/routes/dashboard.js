const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAffiliateDashboard } = require('../controllers/dashboardController');
const { protect, adminOnly, affiliateOnly } = require('../middleware/auth');

router.get('/admin', protect, adminOnly, getAdminDashboard);
router.get('/affiliate', protect, affiliateOnly, getAffiliateDashboard);

module.exports = router;
