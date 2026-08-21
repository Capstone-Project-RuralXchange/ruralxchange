const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'tractor_driver', 'harvester_operator', 'electrician', 'mason',
      'plumber', 'agronomist', 'civil_engineer', 'electrical_engineer',
      'pump_mechanic', 'welder', 'carpenter', 'painter',
      'animal_health_worker', 'refrigeration_technician', 'general_laborer', 'other'
    ]
  },
  displayTitle: String,
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
    certificate: String
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  pricePerHour: Number,
  district: {
    type: String,
    required: true
  },
  state: { type: String, default: 'Karnataka' },
  village: String,
  skills: [String],
  languages: {
    type: [String],
    default: ['Kannada']
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'booked', 'unavailable'],
    default: 'available'
  },
  bookedDates: [{
    start: Date,
    end: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 }
}, { timestamps: true });

specialistSchema.index({ district: 1, specialization: 1, availabilityStatus: 1 });

module.exports = mongoose.model('Specialist', specialistSchema);
