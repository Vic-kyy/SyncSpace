const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage,
    searchUsers,
    getMembers,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/users', protect, searchUsers);
router.get('/members', protect, getMembers);
router.route('/conversations').post(protect, accessConversation).get(protect, getConversations);
router.route('/messages').post(protect, sendMessage);
router.route('/messages/:conversationId').get(protect, getMessages);

module.exports = router;
