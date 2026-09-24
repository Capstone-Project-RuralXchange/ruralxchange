const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Equipment title required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase().replace(/[\s-]+/g, '_') : v),
    enum: [
      'tractor', 'harvester', 'rotavator', 'cultivator', 'seed_drill', 'baler',
      'chaff_cutter', 'power_weeder', 'sprayer', 'drone', 'water_pump', 'thresher',
      'tiller', 'laser_leveler', 'earth_auger', 'tractor_trolley', 'generator',
      'concrete_mixer', 'tent_structure', 'sound_system', 'lighting',
      'welding_machine', 'drill', 'other'
    ]
  },
  description: { type: String, maxlength: 1000 },
  images: [{
    url: String,
    publicId: String
  }],
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day required'],
    min: [0, 'Price cannot be negative']
  },
  pricePerHour: Number,
  district: {
    type: String,
    required: [true, 'District required']
  },
  state: { type: String, default: 'Karnataka' },
  village: String,
  address: { type: String, maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }  // [lng, lat]
  },
  condition: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    enum: ['excellent', 'good', 'fair'],
    default: 'good'
  },
  specifications: {
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: Number,
    horsePower: Number,
    fuelType: {
      type: String,
      trim: true,
      lowercase: true,
      set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
      enum: ['diesel', 'petrol', 'electric', 'manual']
    }
  },
  availabilityStatus: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  bookedDates: [{
    start: Date,
    end: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  requiresSpecialist: { type: Boolean, default: false },
  compatibleSpecialistTypes: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 }
}, { timestamps: true });

equipmentSchema.index({ district: 1, category: 1, availabilityStatus: 1 });
equipmentSchema.index({ owner: 1 });
equipmentSchema.index({ location: '2dsphere' });

// Pre-validate hook to automatically normalize case and formatting for enums
equipmentSchema.pre('validate', function(next) {
  if (this.category && typeof this.category === 'string') {
    this.category = this.category.trim().toLowerCase().replace(/[\s-]+/g, '_');
  }
  if (this.condition && typeof this.condition === 'string') {
    this.condition = this.condition.trim().toLowerCase();
  }
  if (this.availabilityStatus && typeof this.availabilityStatus === 'string') {
    this.availabilityStatus = this.availabilityStatus.trim().toLowerCase();
  }
  if (this.specifications?.fuelType && typeof this.specifications.fuelType === 'string') {
    this.specifications.fuelType = this.specifications.fuelType.trim().toLowerCase();
  }
  next();
});

equipmentSchema.index({ 'rating.average': -1, createdAt: -1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
