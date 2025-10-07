const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }],
  // Stable key for exact participant set (sorted ObjectId strings joined by ':')
  key: { type: String, required: true, unique: true, index: true },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true })

conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })

module.exports = mongoose.model('Conversation', conversationSchema)


