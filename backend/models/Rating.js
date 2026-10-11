const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratingType: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    enum: ['equipment', 'specialist'],
    required: true
  },
  targetEquipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  targetSpecialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist'
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Equipment specific ratings
  equipmentConditionScore: { type: Number, min: 1, max: 5 },
  equipmentReliabilityScore: { type: Number, min: 1, max: 5 },
  // Specialist specific ratings
  specialistSkillScore: { type: Number, min: 1, max: 5 },
  specialistPunctualityScore: { type: Number, min: 1, max: 5 },
  specialistCommunicationScore: { type: Number, min: 1, max: 5 },
  review: {
    type: String,
    maxlength: 500
  },
  comment: {
    type: String,
    maxlength: 500
  },
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-validate hook to synchronize alias fields
ratingSchema.pre('validate', function(next) {
  if (this.ratingType && typeof this.ratingType === 'string') {
    this.ratingType = this.ratingType.trim().toLowerCase();
  }
  if (!this.targetEquipment && this.equipment) {
    this.targetEquipment = this.equipment;
  }
  if (!this.equipment && this.targetEquipment) {
    this.equipment = this.targetEquipment;
  }
  if (!this.targetSpecialist && this.specialist) {
    this.targetSpecialist = this.specialist;
  }
  if (!this.specialist && this.targetSpecialist) {
    this.specialist = this.targetSpecialist;
  }
  if (!this.targetUser && this.ratedUser) {
    this.targetUser = this.ratedUser;
  }
  if (!this.ratedUser && this.targetUser) {
    this.ratedUser = this.targetUser;
  }
  if (!this.review && this.comment) {
    this.review = this.comment;
  }
  if (!this.comment && this.review) {
    this.comment = this.review;
  }
  next();
});

module.exports = mongoose.model('Rating', ratingSchema);
