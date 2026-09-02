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
    enum: [
      'tractor', 'harvester', 'generator', 'water_pump', 'concrete_mixer',
      'rotavator', 'sprayer', 'thresher', 'tiller', 'sound_system',
      'tent_structure', 'lighting', 'welding_machine', 'drill', 'other'
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
    enum: ['excellent', 'good', 'fair'],
    default: 'good'
  },
  specifications: {
    brand: String,
    model: String,
    year: Number,
    horsePower: Number,
    fuelType: { type: String, enum: ['diesel', 'petrol', 'electric', 'manual'] }
  },
  availabilityStatus: {
    type: String,
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

module.exports = mongoose.model('Equipment', equipmentSchema);
