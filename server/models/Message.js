const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: false },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  toRole: { type: String, enum: ['admin','manager','employee'], required: true },
  text: { type: String, required: true, trim: true },
}, { timestamps: true })

messageSchema.index({ toRole: 1, createdAt: -1 })
messageSchema.index({ from: 1, createdAt: -1 })
messageSchema.index({ text: 'text' })
messageSchema.index({ conversationId: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)


