const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { startConversation, getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const uploadChat = require('../middleware/uploadChat');

// Admin ou Affilié démarre une conversation
router.post('/conversations', protect, startConversation);

// Lister les conversations
router.get('/conversations', protect, getConversations);

// Messages d'une conversation
router.get('/conversations/:id/messages', protect, getMessages);

// Envoyer un message (avec ou sans image)
router.post('/conversations/:id/messages', protect, uploadChat.single('image'), sendMessage);

module.exports = router;
