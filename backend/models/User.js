const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name too long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Enter valid Indian mobile number']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    enum: ['seeker', 'provider', 'specialist', 'admin'],
    default: 'seeker'
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    default: 'Karnataka',
    trim: true
  },
  village: { type: String, trim: true },
  preferredLanguage: {
    type: String,
    trim: true,
    lowercase: true,
    set: (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    enum: ['en', 'kn', 'hi'],
    default: 'en'
  },
  avatar: {
    url: String,
    publicId: String
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  earnings: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  bio: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-validate hook
userSchema.pre('validate', function(next) {
  if (this.role && typeof this.role === 'string') {
    this.role = this.role.trim().toLowerCase();
  }
  if (this.preferredLanguage && typeof this.preferredLanguage === 'string') {
    this.preferredLanguage = this.preferredLanguage.trim().toLowerCase();
  }
  next();
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
