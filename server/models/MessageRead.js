const mongoose = require('mongoose')

// Tracks last read timestamp per user per channel (role) or conversation
const messageReadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  // Either channel by role, or future: conversationId
  channelRole: { type: String, enum: ['admin','manager'], required: true },
  lastReadAt: { type: Date, default: Date.now }
}, { timestamps: true })

messageReadSchema.index({ user: 1, channelRole: 1 }, { unique: true })

module.exports = mongoose.model('MessageRead', messageReadSchema)


