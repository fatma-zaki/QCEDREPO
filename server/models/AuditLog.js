const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ['schedule','employee','department','conversation','message'], required: true },
  targetId: { type: Schema.Types.ObjectId },
  metadata: { type: Schema.Types.Mixed },
  ip: { type: String },
}, { timestamps: true });

AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

// Note: removed duplicate legacy schema to avoid redeclaration errors.
