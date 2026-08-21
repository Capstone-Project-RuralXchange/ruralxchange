const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  requirementType: {
    type: String,
    enum: ['equipment', 'specialist', 'bundle', 'professional'],
    required: true
  },
  equipmentNeeded: {
    category: String,
    quantity: Number,
    withOperator: Boolean
  },
  specialistNeeded: {
    specialization: String,
    qualificationLevel: { type: String, enum: ['any', 'certified', 'engineer'] }
  },
  startDate: Date,
  endDate: Date,
  duration: {
    value: Number,
    unit: { type: String, enum: ['hours', 'days', 'weeks'] }
  },
  district: { type: String, required: true },
  village: String,
  state: { type: String, default: 'Karnataka' },
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  status: {
    type: String,
    enum: ['open', 'filled', 'expired', 'cancelled'],
    default: 'open'
  },
  responses: [{
    respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    offeredPrice: Number,
    respondedAt: { type: Date, default: Date.now }
  }],
  expiresAt: Date,
  isUrgent: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

requirementSchema.index({ district: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Requirement', requirementSchema);
