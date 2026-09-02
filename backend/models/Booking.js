const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['equipment_only', 'specialist_only', 'bundle', 'professional_service'],
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  equipmentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialist'
  },
  specialistOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  location: {
    district: { type: String, required: true },
    village: String,
    address: String,
    state: { type: String, default: 'Karnataka' }
  },
  purpose: {
    type: String,
    required: [true, 'Purpose required'],
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pricing: {
    equipmentCost: { type: Number, default: 0 },
    specialistCost: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer'] }
  },
  specialRequirements: String,
  cancellationReason: String,
  completionNotes: String,
  requirementRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requirement'
  },
  ratings: {
    equipmentRating: { submitted: Boolean, ratingId: mongoose.Schema.Types.ObjectId },
    specialistRating: { submitted: Boolean, ratingId: mongoose.Schema.Types.ObjectId }
  }
}, { timestamps: true });

bookingSchema.index({ seeker: 1, status: 1 });
bookingSchema.index({ equipmentOwner: 1, status: 1 });
bookingSchema.index({ specialist: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
