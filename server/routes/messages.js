const express = require('express')
const { verifyToken } = require('../middleware/auth')
const { getMessages, postMessage, markRead, getConversationMessages, getUserConversations, markConversationRead } = require('../controllers/messageController')

const router = express.Router()

router.get('/', verifyToken, getMessages)
router.post('/', verifyToken, postMessage)
router.post('/read', verifyToken, markRead)
// Conversations
router.get('/user/:userId', verifyToken, getUserConversations)
router.post('/:conversationId/read', verifyToken, markConversationRead)
router.get('/:conversationId', verifyToken, getConversationMessages)

module.exports = router


