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
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase().replace(/[\s-]+/g, '_') : v),
    enum: ['equipment', 'specialist', 'bundle', 'professional', 'other'],
    required: true
  },
  equipmentNeeded: {
    category: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === 'string' ? v.trim().toLowerCase().replace(/[\s-]+/g, '_') : v)
    },
    quantity: Number,
    withOperator: Boolean
  },
  specialistNeeded: {
    specialization: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === 'string' ? v.trim().toLowerCase().replace(/[\s-]+/g, '_') : v)
    },
    qualificationLevel: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
      enum: ['any', 'certified', 'engineer']
    }
  },
  startDate: Date,
  endDate: Date,
  duration: {
    value: Number,
    unit: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
      enum: ['hours', 'days', 'weeks']
    }
  },
  district: { type: String, required: true },
  village: String,
  state: { type: String, default: 'Karnataka' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }  // [lng, lat]
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  status: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
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
  views: { type: Number, default: 0 }
}, { timestamps: true });

requirementSchema.index({ district: 1, status: 1, createdAt: -1 });
requirementSchema.index({ requirementType: 1, district: 1, status: 1 });
requirementSchema.index({ location: '2dsphere' });

// Pre-validate hook
requirementSchema.pre('validate', function(next) {
  if (this.requirementType && typeof this.requirementType === 'string') {
    this.requirementType = this.requirementType.trim().toLowerCase().replace(/[\s-]+/g, '_');
  }
  if (this.status && typeof this.status === 'string') {
    this.status = this.status.trim().toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Requirement', requirementSchema);
