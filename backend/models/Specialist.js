const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    set: (v) => {
      if (typeof v !== 'string') return v;
      let s = v.trim().toLowerCase().replace(/[\s-]+/g, '_');
      if (s === 'tractor_operator') s = 'tractor_driver';
      if (s === 'general_labour' || s === 'general_labor') s = 'general_laborer';
      return s;
    },
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
    required: true,
    min: 0
  },
  pricePerHour: Number,
  district: {
    type: String,
    required: true
  },
  state: { type: String, default: 'Karnataka' },
  village: String,
  address: { type: String, maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }  // [lng, lat]
  },
  skills: [String],
  languages: {
    type: [String],
    default: ['Kannada']
  },
  availabilityStatus: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
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
specialistSchema.index({ location: '2dsphere' });

// Pre-validate hook
specialistSchema.pre('validate', function(next) {
  if (this.specialization && typeof this.specialization === 'string') {
    let s = this.specialization.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (s === 'tractor_operator') s = 'tractor_driver';
    if (s === 'general_labour' || s === 'general_labor') s = 'general_laborer';
    this.specialization = s;
  }
  if (this.availabilityStatus && typeof this.availabilityStatus === 'string') {
    this.availabilityStatus = this.availabilityStatus.trim().toLowerCase();
  }
  next();
});

specialistSchema.index({ 'rating.average': -1, isVerified: -1 });

module.exports = mongoose.model('Specialist', specialistSchema);
