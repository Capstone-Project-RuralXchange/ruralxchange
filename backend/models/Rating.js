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
    enum: ['equipment', 'specialist'],
    required: true
  },
  targetEquipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  targetSpecialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist'
  },
  targetUser: {
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
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
