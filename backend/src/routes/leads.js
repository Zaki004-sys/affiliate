const express = require('express');
const router = express.Router();
const { createLead, trackClick, getLeads, updateLeadStatus, getLeadStats } = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', createLead);
router.post('/click', trackClick);
router.get('/', protect, getLeads);
router.get('/stats', protect, getLeadStats);
router.put('/:id/status', protect, adminOnly, updateLeadStatus);

module.exports = router;
