const mongoose = require('mongoose')

const conversationReadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  lastReadAt: { type: Date, default: Date.now }
}, { timestamps: true })

conversationReadSchema.index({ user: 1, conversationId: 1 }, { unique: true })

module.exports = mongoose.model('ConversationRead', conversationReadSchema)


