const Message = require('../models/Message')
const MessageRead = require('../models/MessageRead')
const Conversation = require('../models/Conversation')
const ConversationRead = require('../models/ConversationRead')
const mongoose = require('mongoose')
const { getIo } = require('../realtime')

// @desc Get messages for a role channel with pagination/search
// @route GET /api/messages?toRole=admin|manager&limit=20&before=ISO|ms&search=...&from=employeeId
// @access Private
const getMessages = async (req, res) => {
  try {
    const {
      toRole = 'admin',
      limit = 20,
      before,
      search,
      from
    } = req.query

    if (Message.db.readyState !== 1) {
      return res.json({ success: true, data: [], hasMore: false, unreadCount: 0 })
    }

    const query = { toRole }
    if (before) query.createdAt = { $lt: new Date(isNaN(before) ? before : Number(before)) }
    if (from) query.from = from
    if (search && String(search).trim()) query.$text = { $search: String(search).trim() }

    const pageSize = Math.min(Number(limit) || 20, 100)
    const items = await Message.find(query).sort({ createdAt: -1 }).limit(pageSize + 1).populate('from', 'name email role')
    const hasMore = items.length > pageSize
    const data = hasMore ? items.slice(0, pageSize) : items

    let unreadCount = 0
    if (req.user?._id) {
      const read = await MessageRead.findOne({ user: req.user._id, channelRole: toRole })
      const lastReadAt = read?.lastReadAt || new Date(0)
      unreadCount = await Message.countDocuments({ toRole, createdAt: { $gt: lastReadAt } })
    }

    res.json({ success: true, data, hasMore, unreadCount })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' })
  }
}

// @desc Post a new message to a role channel (and optional conversation)
// @route POST /api/messages
// @access Private
const postMessage = async (req, res) => {
  try {
    const { toRole = 'admin', text, participants } = req.body
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Message text is required' })
    if (!['admin','manager','employee'].includes(toRole)) return res.status(400).json({ success: false, message: 'Invalid toRole' })
    if (participants && (!Array.isArray(participants) || participants.some(id => !mongoose.Types.ObjectId.isValid(String(id))))) {
      return res.status(400).json({ success: false, message: 'Invalid participants list' })
    }

    // Permission guards
    const senderRole = req.user?.role || 'employee'
    const isAdminOrManager = senderRole === 'admin' || senderRole === 'manager'
    if (!isAdminOrManager) {
      // Employees cannot broadcast to roles
      if (toRole !== 'employee') {
        return res.status(403).json({ success: false, message: 'Employees cannot broadcast to roles' })
      }
      // For DMs, ensure at least one participant and not self-only
      if (!participants || participants.length === 0) {
        return res.status(400).json({ success: false, message: 'Recipient required' })
      }
    }

    if (Message.db.readyState !== 1) {
      const convId = `mock-conv-${(Array.isArray(participants) && participants.length) ? participants.sort().join(':') : 'role-'+toRole}`
      const mock = {
        _id: `mock-${Date.now()}`,
        conversationId: convId,
        from: { _id: req.user?._id || 'mock', name: req.user?.username || req.user?.name || 'Admin', role: req.user?.role || 'admin' },
        toRole,
        text: text.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return res.status(201).json({ success: true, data: mock })
    }

    // Conversations
    let conversationId
    if (Array.isArray(participants) && participants.length >= 1) {
      const ids = [req.user._id.toString(), ...participants.map(String)].sort()
      const key = ids.join(':')
      // validate recipients exist if provided
      // (best-effort) - do not block if some missing; you can tighten to require all exist
      // const Employee = require('../models/Employee')
      // await Employee.find({ _id: { $in: participants } }).select('_id')
      let conv = await Conversation.findOne({ key })
      if (!conv) {
        try {
          conv = await Conversation.create({ participants: ids, key, lastMessageAt: new Date() })
        } catch (e) {
          // handle race on unique key
          if (e.code === 11000) {
            conv = await Conversation.findOne({ key })
          } else {
            throw e
          }
        }
      }
      conversationId = conv._id
      await Conversation.updateOne({ _id: conversationId }, { $set: { lastMessageAt: new Date() } })
    }

    const msg = await Message.create({ conversationId, from: req.user._id, toRole, text: text.trim() })
    await msg.populate('from', 'firstName lastName username email role')

    try {
      const io = getIo && getIo()
      if (io) {
        io.to(`role:${toRole}`).emit('message:new', msg)
        io.to(`user:${req.user._id}`).emit('message:new', msg)
        if (conversationId) io.to(`conversation:${conversationId}`).emit('message:new', msg)
        // Emit to participant user rooms for DMs
        if (conversationId && Array.isArray(participants)) {
          participants.forEach(pid => io.to(`user:${pid}`).emit('message:new', msg))
        }
      }
    } catch {}
    res.status(201).json({ success: true, data: msg })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
}

// @desc Get messages for a specific conversation
// @route GET /api/messages/:conversationId
// @access Private
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { before, limit = 50 } = req.query
    if (Message.db.readyState !== 1) return res.json({ success: true, data: [], hasMore: false })
    const conv = await Conversation.findById(conversationId).lean()
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' })
    // access control: requester must be participant
    const isParticipant = (conv.participants || []).map(String).includes(String(req.user._id))
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied' })

    const query = { conversationId }
    if (before) query.createdAt = { $lt: new Date(isNaN(before) ? before : Number(before)) }
    const pageSize = Math.min(Number(limit) || 50, 200)
    const itemsDesc = await Message.find(query).sort({ createdAt: -1 }).limit(pageSize + 1).populate('from', 'name email role')
    const hasMore = itemsDesc.length > pageSize
    const data = (hasMore ? itemsDesc.slice(0, pageSize) : itemsDesc).reverse()
    res.json({ success: true, data, hasMore })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversation messages' })
  }
}

// @desc Get conversations by user with last message preview and unread count
// @route GET /api/messages/user/:userId
// @access Private
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params
    if (Conversation.db.readyState !== 1) return res.json({ success: true, data: [] })
    if (String(userId) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' })

    const convs = await Conversation.find({ participants: userId }).sort({ lastMessageAt: -1 }).lean()
    const convIds = convs.map(c => c._id)
    const lastMessages = await Message.aggregate([
      { $match: { conversationId: { $in: convIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', last: { $first: '$$ROOT' } } }
    ])
    const readMapDocs = await ConversationRead.find({ user: userId, conversationId: { $in: convIds } }).lean()
    const readMap = new Map(readMapDocs.map(r => [String(r.conversationId), new Date(r.lastReadAt)]))

    // compute unread count per conversation
    const unreadCounts = await Promise.all(convs.map(async (c) => {
      const lastReadAt = readMap.get(String(c._id)) || new Date(0)
      const count = await Message.countDocuments({ conversationId: c._id, createdAt: { $gt: lastReadAt } })
      return [String(c._id), count]
    }))
    const unreadMap = new Map(unreadCounts)

    const lmMap = new Map(lastMessages.map(m => [String(m._id), m.last]))
    const data = convs.map(c => ({
      _id: c._id,
      participants: c.participants,
      lastMessageAt: c.lastMessageAt,
      lastMessage: lmMap.get(String(c._id)) ? {
        _id: lmMap.get(String(c._id))._id,
        text: lmMap.get(String(c._id)).text,
        toRole: lmMap.get(String(c._id)).toRole,
        createdAt: lmMap.get(String(c._id)).createdAt,
      } : null,
      unreadCount: unreadMap.get(String(c._id)) || 0
    }))
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' })
  }
}

// @desc Mark conversation read
// @route POST /api/messages/:conversationId/read
// @access Private
const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    if (ConversationRead.db.readyState !== 1) return res.json({ success: true, data: { lastReadAt: new Date() } })
    const doc = await ConversationRead.findOneAndUpdate(
      { user: req.user._id, conversationId },
      { $set: { lastReadAt: new Date() } },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: { lastReadAt: doc.lastReadAt } })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to mark conversation read' })
  }
}

// @desc Mark messages as read up to now for a role channel
// @route POST /api/messages/read { channelRole }
// @access Private
const markRead = async (req, res) => {
  try {
    const { channelRole = 'admin' } = req.body
    if (!['admin','manager'].includes(channelRole)) return res.status(400).json({ success: false, message: 'Invalid channel' })

    if (MessageRead.db.readyState !== 1) {
      return res.json({ success: true, data: { lastReadAt: new Date() } })
    }

    const doc = await MessageRead.findOneAndUpdate(
      { user: req.user._id, channelRole },
      { $set: { lastReadAt: new Date() } },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: { lastReadAt: doc.lastReadAt } })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to mark read' })
  }
}

module.exports = { getMessages, postMessage, markRead, getConversationMessages, getUserConversations, markConversationRead }


