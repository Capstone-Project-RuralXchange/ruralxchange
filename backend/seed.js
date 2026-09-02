/**
 * RuralXchange — Simplified 10 User Seed Script
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { KARNATAKA_DISTRICT_COORDS } = require('./utils/geocode');

const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Specialist = require('./models/Specialist');
const Booking = require('./models/Booking');
const Requirement = require('./models/Requirement');
const Rating = require('./models/Rating');

// ─── 1. 10 USERS ─────────────────────────────────────────────────────────────
const usersData = [
  // Admins (2)
  { name: 'Super Admin', phone: '9000000000', password: 'admin123', role: 'admin', district: 'Bengaluru Urban', isVerified: true },
  { name: 'Regional Admin', phone: '9000000001', password: 'admin123', role: 'admin', district: 'Mysuru', isVerified: true },
  
  // Seekers (3)
  { name: 'Seeker Mysuru', phone: '9100000001', password: 'pass123', role: 'seeker', district: 'Mysuru', village: 'Hunsur', isVerified: true },
  { name: 'Seeker Mandya', phone: '9100000002', password: 'pass123', role: 'seeker', district: 'Mandya', village: 'Maddur', isVerified: true },
  { name: 'Seeker Hassan', phone: '9100000003', password: 'pass123', role: 'seeker', district: 'Hassan', village: 'Alur', isVerified: true },

  // Providers (3)
  { name: 'Provider Mysuru', phone: '9200000001', password: 'pass123', role: 'provider', district: 'Mysuru', village: 'Nanjangud', isVerified: true },
  { name: 'Provider Mandya', phone: '9200000002', password: 'pass123', role: 'provider', district: 'Mandya', village: 'Malavalli', isVerified: true },
  { name: 'Provider Hubballi', phone: '9200000003', password: 'pass123', role: 'provider', district: 'Dharwad', village: 'Hubballi', isVerified: true },

  // Specialists (2)
  { name: 'Specialist Electrician', phone: '9300000001', password: 'pass123', role: 'specialist', district: 'Tumakuru', village: 'Sira', isVerified: true },
  { name: 'Specialist Tractor Driver', phone: '9300000002', password: 'pass123', role: 'specialist', district: 'Mandya', village: 'Maddur', isVerified: true },
];

// ─── 2. SAMPLE EQUIPMENT ──────────────────────────────────────────────────────
const equipmentData = [
  { ownerIdx: 0, title: 'Mahindra 575 DI Tractor', category: 'tractor', description: '45HP Tractor in great condition.', pricePerDay: 2000, district: 'Mysuru' },
  { ownerIdx: 0, title: 'Borewell Submersible Pump', category: 'water_pump', description: 'High capacity water pump.', pricePerDay: 800, district: 'Mysuru' },
  { ownerIdx: 1, title: 'Paddy Combine Harvester', category: 'harvester', description: 'Fast harvesting for paddy.', pricePerDay: 5000, district: 'Mandya' },
  { ownerIdx: 2, title: 'Heavy Duty Rotavator', category: 'rotavator', description: 'Perfect for deep ploughing.', pricePerDay: 1500, district: 'Dharwad' }
];

// ─── 3. SAMPLE SPECIALIST PROFILES ──────────────────────────────────────────
const specialistProfilesData = [
  { userIdx: 0, specialization: 'electrician', experience: 5, pricePerDay: 600, pricePerHour: 100 },
  { userIdx: 1, specialization: 'tractor_driver', experience: 10, pricePerDay: 800, pricePerHour: 150 }
];

// ─── 4. SAMPLE REQUIREMENTS (Notice Board) ───────────────────────────────────
const requirementsData = [
  { seekerIdx: 0, title: 'Need a tractor for 3 days', requirementType: 'equipment', category: 'tractor', district: 'Mysuru', description: 'Urgent requirement for sugarcane field.' },
  { seekerIdx: 1, title: 'Need an electrician to fix pump', requirementType: 'specialist', category: 'electrician', district: 'Mandya', description: 'Pump motor is burnt, need immediate help.' }
];

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to DB');

    // Clear DB
    await Promise.all([
      User.deleteMany({}), Equipment.deleteMany({}), Specialist.deleteMany({}),
      Booking.deleteMany({}), Requirement.deleteMany({}), Rating.deleteMany({})
    ]);

    // Create Users
    const usersWithLocation = usersData.map(u => {
      const coords = KARNATAKA_DISTRICT_COORDS[u.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return { ...u, location: { type: 'Point', coordinates: [coords.lng, coords.lat] } };
    });
    const createdUsers = await User.create(usersWithLocation);
    const seekers = createdUsers.filter(u => u.role === 'seeker');
    const providers = createdUsers.filter(u => u.role === 'provider');
    const specUsers = createdUsers.filter(u => u.role === 'specialist');

    // Create Equipment
    const eqToInsert = equipmentData.map(({ ownerIdx, ...eq }) => {
      const coords = KARNATAKA_DISTRICT_COORDS[eq.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return {
        ...eq,
        owner: providers[ownerIdx]._id,
        state: 'Karnataka',
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        availabilityStatus: 'available'
      };
    });
    await Equipment.create(eqToInsert);

    // Create Specialists
    const spToInsert = specialistProfilesData.map(({ userIdx, ...sp }) => {
      const district = specUsers[userIdx].district;
      const coords = KARNATAKA_DISTRICT_COORDS[district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return {
        ...sp,
        user: specUsers[userIdx]._id,
        district,
        state: 'Karnataka',
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        availabilityStatus: 'available',
        isVerified: true
      };
    });
    await Specialist.create(spToInsert);

    // Create Requirements
    const reqToInsert = requirementsData.map(({ seekerIdx, ...req }) => {
      const coords = KARNATAKA_DISTRICT_COORDS[req.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return {
        ...req,
        postedBy: seekers[seekerIdx]._id,
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        expiresAt: new Date(Date.now() + 14 * 86400000),
        status: 'open'
      };
    });
    await Requirement.create(reqToInsert);

    console.log('✅ Simplified Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
}

seedDatabase();
