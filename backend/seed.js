/**
 * RuralXchange — Comprehensive Seed File
 * 
 * Seeds: 12 Users · 20 Equipment · 10 Specialists · 12 Requirements · 15 Bookings · 20 Ratings
 * 
 * Run: node seed.js
 * 
 * Test Accounts:
 *   Seeker    → 9100000001 / pass123
 *   Provider  → 9200000001 / pass123
 *   Specialist→ 9300000001 / pass123
 *   Admin     → 9000000000 / admin123
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User       = require('./models/User');
const Equipment  = require('./models/Equipment');
const Specialist = require('./models/Specialist');
const Booking    = require('./models/Booking');
const Requirement= require('./models/Requirement');
const Rating     = require('./models/Rating');

// ─── USERS ───────────────────────────────────────────────────────────────────
const usersData = [
  // --- Seekers ---
  { name: 'Krishnamurthy B.',   phone: '9100000001', email: 'seeker001@ruralxchange.local', password: 'pass123', role: 'seeker',    district: 'Mandya',           village: 'Maddur',       state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Savitha Naik',       phone: '9100000002', email: 'seeker002@ruralxchange.local', password: 'pass123', role: 'seeker',    district: 'Tumkur',           village: 'Sira',         state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Prakash Gowda',      phone: '9100000003', email: 'seeker003@ruralxchange.local', password: 'pass123', role: 'seeker',    district: 'Hassan',           village: 'Alur',         state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Anitha Reddy',       phone: '9100000004', email: 'seeker004@ruralxchange.local', password: 'pass123', role: 'seeker',    district: 'Kolar',            village: 'Bangarpet',    state: 'Karnataka', preferredLanguage: 'en' },

  // --- Providers ---
  { name: 'Ramu Gowda',         phone: '9200000001', email: 'provider001@ruralxchange.local', password: 'pass123', role: 'provider',  district: 'Mandya',           village: 'Kirugavalu',   state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Manjula Devi',       phone: '9200000002', email: 'provider002@ruralxchange.local', password: 'pass123', role: 'provider',  district: 'Hassan',           village: 'Sakleshpur',   state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Suresh Nagaraj',     phone: '9200000003', email: 'provider003@ruralxchange.local', password: 'pass123', role: 'provider',  district: 'Mysuru',           village: 'Nanjangud',    state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Venkatesh Rao',      phone: '9200000004', email: 'provider004@ruralxchange.local', password: 'pass123', role: 'provider',  district: 'Davangere',        village: 'Honnali',      state: 'Karnataka', preferredLanguage: 'en' },

  // --- Specialists ---
  { name: 'Shiva Kumar',        phone: '9300000001', email: 'specialist001@ruralxchange.local', password: 'pass123', role: 'specialist', district: 'Mysuru',          village: 'Nanjangud',    state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Vijay Engineer',     phone: '9300000002', email: 'specialist002@ruralxchange.local', password: 'pass123', role: 'specialist', district: 'Bengaluru Rural', village: 'Devanahalli',  state: 'Karnataka', preferredLanguage: 'en' },
  { name: 'Basavanna Patil',    phone: '9300000003', email: 'specialist003@ruralxchange.local', password: 'pass123', role: 'specialist', district: 'Dharwad',         village: 'Kundgol',      state: 'Karnataka', preferredLanguage: 'kn' },
  { name: 'Nirmala Bai',        phone: '9300000004', email: 'specialist004@ruralxchange.local', password: 'pass123', role: 'specialist', district: 'Raichur',         village: 'Lingasugur',   state: 'Karnataka', preferredLanguage: 'hi' },

  // --- Admin ---
  { name: 'Admin RuralXchange', phone: '9000000000', email: 'admin@ruralxchange.local', password: 'admin123', role: 'admin',    district: 'Bengaluru Urban',  village: '',             state: 'Karnataka', preferredLanguage: 'en' },
];

// ─── EQUIPMENT (20 items) ─────────────────────────────────────────────────────
// Owner index refers to position in providers array (0–3)
const equipmentData = [
  // ── Tractors ──
  {
    ownerIdx: 0,
    title: 'Mahindra 575 DI Tractor – 45HP',
    category: 'tractor',
    description: 'Well-maintained Mahindra 575 DI tractor ideal for ploughing, harrowing, and transport work. GPS-guided optional. Available with attachments.',
    pricePerDay: 2200, pricePerHour: 320,
    minimumRentalDays: 1, maximumRentalDays: 15,
    district: 'Mandya', village: 'Kirugavalu',
    condition: 'excellent',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'Mahindra', model: '575 DI', year: 2020, horsePower: 45, fuelType: 'diesel' },
    features: ['GPS Optional', 'Power Steering', 'Wide Tyres', 'Front Loader Attachment'],
    rating: { average: 4.7, count: 14 },
  },
  {
    ownerIdx: 0,
    title: 'John Deere 5050D Tractor – 50HP',
    category: 'tractor',
    description: 'Premium John Deere tractor for heavy-duty farming. Comes with a trained operator on request. Ideal for large paddy and sugarcane fields.',
    pricePerDay: 2800, pricePerHour: 420,
    minimumRentalDays: 1, maximumRentalDays: 20,
    district: 'Mandya', village: 'Malavalli',
    condition: 'excellent',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'John Deere', model: '5050D', year: 2022, horsePower: 50, fuelType: 'diesel' },
    features: ['AC Cabin', '4WD', 'Power Steering', 'Hydraulic Lift'],
    rating: { average: 4.9, count: 8 },
  },

  // ── Harvesters ──
  {
    ownerIdx: 1,
    title: 'Kubota DC-70 Combine Harvester',
    category: 'harvester',
    description: 'High-efficiency combine harvester for paddy and wheat. Cuts and threshes in one pass. Reduces post-harvest losses by 30%.',
    pricePerDay: 5500, pricePerHour: 700,
    minimumRentalDays: 1, maximumRentalDays: 10,
    district: 'Hassan', village: 'Sakleshpur',
    condition: 'good',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['harvester_operator'],
    specifications: { brand: 'Kubota', model: 'DC-70', year: 2019, horsePower: 70, fuelType: 'diesel' },
    features: ['Auto Threshing', 'Grain Tank 60L', 'Low Grain Loss'],
    rating: { average: 4.5, count: 11 },
  },

  // ── Water Pumps ──
  {
    ownerIdx: 2,
    title: 'Kirloskar Star-1 Water Pump – 5HP',
    category: 'water_pump',
    description: 'Reliable centrifugal pump for irrigation. Covers 2 acres per hour. Suitable for bore wells and open wells up to 60ft depth.',
    pricePerDay: 500, pricePerHour: 80,
    minimumRentalDays: 1, maximumRentalDays: 30,
    district: 'Mysuru', village: 'Nanjangud',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Kirloskar', model: 'Star-1', horsePower: 5, fuelType: 'electric' },
    features: ['60ft Suction', 'Drip Compatible', '2 Acres/Hour'],
    rating: { average: 4.3, count: 19 },
  },
  {
    ownerIdx: 3,
    title: 'Texmo TJ7.5 Submersible Pump – 7.5HP',
    category: 'water_pump',
    description: 'High-head submersible pump for deep bore wells up to 150ft. Perfect for summer irrigation in Davangere and surrounding districts.',
    pricePerDay: 750, pricePerHour: 110,
    minimumRentalDays: 1, maximumRentalDays: 60,
    district: 'Davangere', village: 'Honnali',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Texmo', model: 'TJ7.5', horsePower: 7.5, fuelType: 'electric' },
    features: ['150ft Head', 'Stainless Body', 'Auto Thermal Cutoff'],
    rating: { average: 4.1, count: 7 },
  },

  // ── Generators ──
  {
    ownerIdx: 2,
    title: 'Honda EP5000CX Generator – 5KVA',
    category: 'generator',
    description: 'Silent inverter generator for events, farm operations, and construction sites. Clean power for sensitive electronics.',
    pricePerDay: 1200, pricePerHour: 180,
    minimumRentalDays: 1, maximumRentalDays: 7,
    district: 'Mysuru', village: 'Nanjangud',
    condition: 'excellent',
    requiresSpecialist: false,
    specifications: { brand: 'Honda', model: 'EP5000CX', horsePower: 9, fuelType: 'petrol' },
    features: ['Silent Operation', 'Clean Power', 'Eco Throttle', 'Full-Auto Voltage'],
    rating: { average: 4.8, count: 22 },
  },
  {
    ownerIdx: 0,
    title: 'Koel Green 15KVA Diesel Generator',
    category: 'generator',
    description: 'Heavy-duty 15KVA generator for large events, wedding halls, and construction sites. Complete with fuel tank and starter.',
    pricePerDay: 2800, pricePerHour: 450,
    minimumRentalDays: 1, maximumRentalDays: 5,
    district: 'Mandya', village: 'Kirugavalu',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Koel', model: 'KG-15', horsePower: 22, fuelType: 'diesel' },
    features: ['15KVA Output', 'Auto Start', 'Sound Proof Canopy', 'Built-in Fuel Tank'],
    rating: { average: 4.2, count: 6 },
  },

  // ── Rotavators ──
  {
    ownerIdx: 1,
    title: 'Fieldking Super Seeder Rotavator – 7ft',
    category: 'rotavator',
    description: 'Heavy-duty 7-foot rotavator for deep soil tillage. Ideal for sugarcane, paddy, and vegetable crop preparation.',
    pricePerDay: 1800, pricePerHour: 270,
    minimumRentalDays: 1, maximumRentalDays: 10,
    district: 'Hassan', village: 'Sakleshpur',
    condition: 'good',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'Fieldking', model: 'Super Seeder', fuelType: 'diesel' },
    features: ['7ft Width', 'Depth Control', 'Universal Tractor Fit'],
    rating: { average: 4.4, count: 9 },
  },

  // ── Sprayers ──
  {
    ownerIdx: 3,
    title: 'Neptune 16L Battery Power Sprayer',
    category: 'sprayer',
    description: 'Rechargeable battery knapsack sprayer. 12V motor, 4-hour battery life. Ideal for paddy, sugarcane, vegetables, and orchards.',
    pricePerDay: 300, pricePerHour: 50,
    minimumRentalDays: 1, maximumRentalDays: 30,
    district: 'Davangere', village: 'Honnali',
    condition: 'excellent',
    requiresSpecialist: false,
    specifications: { brand: 'Neptune', model: 'BPS-16', fuelType: 'electric' },
    features: ['16L Tank', '12V Battery', 'Adjustable Nozzle', 'Anti-Drip Valve'],
    rating: { average: 4.6, count: 31 },
  },
  {
    ownerIdx: 2,
    title: 'Boom Sprayer (Tractor Mounted) – 12m',
    category: 'sprayer',
    description: 'Professional tractor-mounted boom sprayer covering 12-metre width in a single pass. Ideal for large paddy and corn fields.',
    pricePerDay: 1200, pricePerHour: 180,
    minimumRentalDays: 1, maximumRentalDays: 7,
    district: 'Mysuru', village: 'T Narasipur',
    condition: 'good',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'GreenMax', model: 'BM-1200', fuelType: 'manual' },
    features: ['12m Width', '500L Tank', 'Pressure Regulator', 'Tractor PTO Drive'],
    rating: { average: 4.0, count: 5 },
  },

  // ── Thresher ──
  {
    ownerIdx: 0,
    title: 'Vikram Multi-Crop Thresher – 7.5HP',
    category: 'thresher',
    description: 'Stationary multi-crop thresher for paddy, wheat, ragi, and sunflower. Engine-powered, single-operator. Output: 800kg/hour.',
    pricePerDay: 1400, pricePerHour: 200,
    minimumRentalDays: 1, maximumRentalDays: 15,
    district: 'Mandya', village: 'Malavalli',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Vikram', model: 'MCT-7500', horsePower: 7.5, fuelType: 'diesel' },
    features: ['Multi-Crop', '800kg/hr Output', 'Low Grain Loss', 'Portable Frame'],
    rating: { average: 4.3, count: 13 },
  },

  // ── Concrete Mixer ──
  {
    ownerIdx: 3,
    title: 'Jaypee 1-Bag Concrete Mixer – Electric',
    category: 'concrete_mixer',
    description: 'Electric drum concrete mixer for house construction. 1-bag capacity (50kg cement). Simple operation, no specialist required.',
    pricePerDay: 800, pricePerHour: 120,
    minimumRentalDays: 1, maximumRentalDays: 30,
    district: 'Davangere', village: 'Channagiri',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Jaypee', model: 'JCM-1', fuelType: 'electric' },
    features: ['1 Bag Capacity', '230V Motor', 'Tilting Drum', 'Rubber Tyres'],
    rating: { average: 4.1, count: 16 },
  },

  // ── Sound Systems ──
  {
    ownerIdx: 2,
    title: 'JBL Line Array Sound System – 2000W',
    category: 'sound_system',
    description: 'Professional line array sound system for weddings, political events, and large functions. Includes 2 tops, 2 subs, amplifiers, and stands.',
    pricePerDay: 3500, pricePerHour: 600,
    minimumRentalDays: 1, maximumRentalDays: 3,
    district: 'Mysuru', village: 'Mysuru City',
    condition: 'excellent',
    requiresSpecialist: true,
    specifications: { brand: 'JBL', model: 'SRX815', fuelType: 'electric' },
    features: ['2000W RMS', 'Line Array', 'Digital Mixer', 'Wireless Mics'],
    rating: { average: 4.8, count: 24 },
  },

  // ── Lighting ──
  {
    ownerIdx: 1,
    title: 'LED Stage Lighting Set – 500 Sqft Coverage',
    category: 'lighting',
    description: 'Complete LED lighting package for weddings and functions. Includes roof lights, pillar lights, fairy lights, and stage spotlights.',
    pricePerDay: 2200, pricePerHour: 350,
    minimumRentalDays: 1, maximumRentalDays: 3,
    district: 'Hassan', village: 'Hassan City',
    condition: 'excellent',
    requiresSpecialist: false,
    specifications: { brand: 'Philips', fuelType: 'electric' },
    features: ['500 Sqft Coverage', 'DMX Control', 'Multiple Colors', 'Easy Setup'],
    rating: { average: 4.6, count: 18 },
  },

  // ── Welding Machine ──
  {
    ownerIdx: 3,
    title: 'Lincoln Electric Arc Welding Machine – 300A',
    category: 'welding_machine',
    description: 'Heavy-duty arc welding machine for farm gate, pump house, and structural work. Handles all electrode sizes.',
    pricePerDay: 600, pricePerHour: 100,
    minimumRentalDays: 1, maximumRentalDays: 14,
    district: 'Davangere', village: 'Honnali',
    condition: 'good',
    requiresSpecialist: true,
    specifications: { brand: 'Lincoln Electric', model: 'AC-300', fuelType: 'electric' },
    features: ['300A Output', 'AC/DC Modes', 'Electrode 2-6mm', 'Duty Cycle 60%'],
    rating: { average: 4.2, count: 7 },
  },

  // ── Tiller ──
  {
    ownerIdx: 0,
    title: 'Honda FJ500 Power Tiller – 5HP',
    category: 'tiller',
    description: 'Walk-behind power tiller for small and medium farms. Ideal for kitchen gardens, paddy seedbed preparation, and inter-crop cultivation.',
    pricePerDay: 700, pricePerHour: 110,
    minimumRentalDays: 1, maximumRentalDays: 14,
    district: 'Mandya', village: 'Nagamangala',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'Honda', model: 'FJ500', horsePower: 5, fuelType: 'diesel' },
    features: ['Walk-Behind', 'Foldable Handles', 'Reverse Gear', 'Tine Depth Control'],
    rating: { average: 4.4, count: 12 },
  },

  // ── Drill ──
  {
    ownerIdx: 2,
    title: 'Bosch SDS-Max Rotary Hammer Drill – 1750W',
    category: 'drill',
    description: 'Professional rotary hammer drill for bore well casing, RCC drilling, and foundation work. Includes 3 modes: drilling, hammering, chiseling.',
    pricePerDay: 500, pricePerHour: 80,
    minimumRentalDays: 1, maximumRentalDays: 14,
    district: 'Mysuru', village: 'Nanjangud',
    condition: 'excellent',
    requiresSpecialist: false,
    specifications: { brand: 'Bosch', model: 'GSH 5 CE', fuelType: 'electric' },
    features: ['3-Mode', '1750W', 'Anti-Vibration', '28mm Chuck'],
    rating: { average: 4.5, count: 9 },
  },

  // ── Tent Structure ──
  {
    ownerIdx: 1,
    title: 'Aluminum Tent Structure – 40×60 ft',
    category: 'tent_structure',
    description: 'Weatherproof aluminum frame tent for outdoor weddings, functions, and farm events. Setup included. Capacity: 300 guests.',
    pricePerDay: 4500, pricePerHour: 0,
    minimumRentalDays: 1, maximumRentalDays: 5,
    district: 'Hassan', village: 'Belur',
    condition: 'good',
    requiresSpecialist: false,
    specifications: { brand: 'TentMaster', fuelType: 'manual' },
    features: ['40×60 ft', 'Wind Resistant', '300 Guest Capacity', 'Setup Team Included'],
    rating: { average: 4.3, count: 10 },
  },

  // ── Extra Tractor ──
  {
    ownerIdx: 3,
    title: 'Sonalika DI 750 III Tractor – 75HP',
    category: 'tractor',
    description: 'High-horsepower tractor for deep ploughing and large-scale sugarcane cultivation. Suitable for 50+ acre farms.',
    pricePerDay: 3500, pricePerHour: 520,
    minimumRentalDays: 1, maximumRentalDays: 20,
    district: 'Davangere', village: 'Harihara',
    condition: 'good',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'Sonalika', model: 'DI 750 III', year: 2021, horsePower: 75, fuelType: 'diesel' },
    features: ['75HP', 'Dual Clutch', 'Power Steering', 'Heavy Lift Hydraulics'],
    rating: { average: 4.6, count: 5 },
  },

  // ── Extra Sprayer ──
  {
    ownerIdx: 2,
    title: 'Drone Spray Service Equipment (UAV) – 10L',
    category: 'sprayer',
    description: 'Agricultural drone for aerial pesticide and fertilizer spraying. 10-litre tank, covers 1 acre in 10 minutes. Operator included.',
    pricePerDay: 4000, pricePerHour: 600,
    minimumRentalDays: 1, maximumRentalDays: 7,
    district: 'Mysuru', village: 'Hunsur',
    condition: 'excellent',
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver'],
    specifications: { brand: 'Garuda Aerospace', model: 'KISAN DRONE', fuelType: 'electric' },
    features: ['10L Tank', '1 Acre/10 Min', 'GPS Auto-Flight', 'Obstacle Avoidance'],
    rating: { average: 4.9, count: 4 },
  },
];

// ─── SPECIALISTS (10 profiles) ─────────────────────────────────────────────────
// userIdx refers to position in specialist users array (0–3)
const specialistData = [
  {
    userIdx: 0,
    specialization: 'tractor_driver',
    displayTitle: 'Senior Tractor & Harvester Operator',
    experience: 12,
    pricePerDay: 700, pricePerHour: 110,
    skills: ['Ploughing', 'Harrowing', 'Rotavator Operation', 'Paddy Transplanting', 'Transport Haulage', 'Deep Tillage'],
    languages: ['Kannada', 'Hindi'],
    qualifications: [{ degree: 'ITI Tractor Mechanic', institution: 'Govt ITI Mandya', year: 2012 }],
    isVerified: true,
    completedJobs: 87,
    rating: { average: 4.8, count: 21 },
  },
  {
    userIdx: 1,
    specialization: 'electrician',
    displayTitle: 'Licensed Electrical Contractor',
    experience: 9,
    pricePerDay: 900, pricePerHour: 150,
    skills: ['LT Wiring', 'Motor Rewinding', 'Pump Installation', 'Solar Panel Wiring', 'Panel Board Work', 'Street Lights'],
    languages: ['Kannada', 'English', 'Hindi'],
    qualifications: [
      { degree: 'ITI Electrician', institution: 'Govt ITI Bangalore Rural', year: 2015 },
      { degree: 'BESCOM Licensed Contractor', institution: 'BESCOM', year: 2017, certificate: 'BES-LT-20345' }
    ],
    isVerified: true,
    completedJobs: 64,
    rating: { average: 4.7, count: 18 },
  },
  {
    userIdx: 1,
    specialization: 'pump_mechanic',
    displayTitle: 'Pump Mechanic & Irrigation Technician',
    experience: 7,
    pricePerDay: 750, pricePerHour: 120,
    skills: ['Submersible Pump Repair', 'Bore Well Testing', 'Drip Irrigation Setup', 'Sprinkler Layout', 'Motor Winding', 'Pipeline Plumbing'],
    languages: ['Kannada', 'English'],
    qualifications: [{ degree: 'KSSIDC Irrigation Training', institution: 'KSSIDC Bengaluru', year: 2018 }],
    isVerified: true,
    completedJobs: 52,
    rating: { average: 4.5, count: 14 },
  },
  {
    userIdx: 2,
    specialization: 'mason',
    displayTitle: 'Master Mason & Construction Supervisor',
    experience: 18,
    pricePerDay: 650, pricePerHour: 100,
    skills: ['Brick Laying', 'Plastering', 'Tile Work', 'Stone Masonry', 'Foundation Digging', 'Ferro-Cement Tanks'],
    languages: ['Kannada'],
    qualifications: [],
    isVerified: false,
    completedJobs: 143,
    rating: { average: 4.6, count: 37 },
  },
  {
    userIdx: 2,
    specialization: 'welder',
    displayTitle: 'Certified Arc & MIG Welder',
    experience: 11,
    pricePerDay: 700, pricePerHour: 115,
    skills: ['Arc Welding', 'MIG Welding', 'Gate Fabrication', 'Pump House Construction', 'Trailer Repair', 'Stainless Steel Welding'],
    languages: ['Kannada', 'Hindi'],
    qualifications: [{ degree: 'ITI Welding', institution: 'Govt ITI Dharwad', year: 2013 }],
    isVerified: true,
    completedJobs: 78,
    rating: { average: 4.4, count: 16 },
  },
  {
    userIdx: 3,
    specialization: 'agronomist',
    displayTitle: 'Agricultural Scientist & Crop Advisor',
    experience: 6,
    pricePerDay: 1500, pricePerHour: 250,
    skills: ['Soil Health Card', 'Crop Planning', 'Fertilizer Scheduling', 'IPM (Integrated Pest Management)', 'Drip Design', 'Organic Farming'],
    languages: ['Kannada', 'Hindi', 'English'],
    qualifications: [
      { degree: 'B.Sc Agriculture', institution: 'UAS Raichur', year: 2018 },
      { degree: 'M.Sc Agronomy', institution: 'UAS Dharwad', year: 2020 }
    ],
    isVerified: true,
    completedJobs: 29,
    rating: { average: 4.9, count: 12 },
  },
  {
    userIdx: 0,
    specialization: 'harvester_operator',
    displayTitle: 'Kubota Combine Harvester Operator',
    experience: 8,
    pricePerDay: 850, pricePerHour: 130,
    skills: ['Combine Harvesting', 'Paddy Harvesting', 'Wheat Harvesting', 'Machine Maintenance', 'Field Assessment', 'Straw Management'],
    languages: ['Kannada'],
    qualifications: [{ degree: 'Kubota Operator Training', institution: 'Kubota India', year: 2016 }],
    isVerified: true,
    completedJobs: 61,
    rating: { average: 4.7, count: 19 },
  },
  {
    userIdx: 1,
    specialization: 'civil_engineer',
    displayTitle: 'Civil Engineer – Farm Structures & Bore Wells',
    experience: 4,
    pricePerDay: 1800, pricePerHour: 300,
    skills: ['RCC Design', 'Bore Well Supervision', 'Farm Pond Layout', 'Retaining Wall Design', 'Water Tank Construction', 'Estimate Preparation'],
    languages: ['Kannada', 'English'],
    qualifications: [
      { degree: 'B.E. Civil Engineering', institution: 'VTU Belagavi', year: 2020 },
      { degree: 'AutoCAD Certified', institution: 'CADD Centre Mysuru', year: 2021 }
    ],
    isVerified: true,
    completedJobs: 22,
    rating: { average: 4.8, count: 9 },
  },
  {
    userIdx: 2,
    specialization: 'carpenter',
    displayTitle: 'Skilled Carpenter – Farm & Household',
    experience: 14,
    pricePerDay: 600, pricePerHour: 95,
    skills: ['Door & Window Frames', 'Farm Shed Construction', 'Bullock Cart Repair', 'Furniture Repair', 'Wooden Storage Bins', 'Bamboo Work'],
    languages: ['Kannada'],
    qualifications: [],
    isVerified: false,
    completedJobs: 110,
    rating: { average: 4.3, count: 28 },
  },
  {
    userIdx: 3,
    specialization: 'animal_health_worker',
    displayTitle: 'Livestock Health Worker & Vaccinator',
    experience: 9,
    pricePerDay: 1000, pricePerHour: 160,
    skills: ['Cattle Vaccination', 'Foot & Mouth Disease Control', 'De-Worming', 'AI (Artificial Insemination)', 'Goat & Sheep Health', 'Emergency First Aid'],
    languages: ['Kannada', 'Hindi'],
    qualifications: [
      { degree: 'Diploma in Animal Husbandry', institution: 'KVAFSU Bidar', year: 2015 },
      { degree: 'Registered Para-vet', institution: 'Dept. of AH & VS Karnataka', year: 2016, certificate: 'AHVS-RV-7892' }
    ],
    isVerified: true,
    completedJobs: 93,
    rating: { average: 4.6, count: 25 },
  },
];

// ─── REQUIREMENTS (12 notices) ────────────────────────────────────────────────
// seekerIdx: index in seekers array (0–3)
const requirementsData = [
  {
    seekerIdx: 0,
    title: 'Tractor needed for 3-day paddy ploughing – Mandya',
    description: 'Need a 35–45 HP tractor for deep ploughing of 8 acres paddy field. Prefer with rotavator attachment. Kirugavalu to Malavalli route.',
    requirementType: 'bundle',
    equipmentNeeded: { category: 'tractor', quantity: 1, withOperator: true },
    specialistNeeded: { specialization: 'tractor_driver', qualificationLevel: 'any' },
    district: 'Mandya', village: 'Kirugavalu',
    budget: { min: 5000, max: 8000 },
    duration: { value: 3, unit: 'days' },
    isUrgent: true,
  },
  {
    seekerIdx: 1,
    title: 'Water pump for summer irrigation – Tumkur',
    description: 'Looking to rent a 5HP water pump for irrigation of my 4-acre tomato farm. Need for approximately 20 days during the dry season.',
    requirementType: 'equipment',
    equipmentNeeded: { category: 'water_pump', quantity: 1, withOperator: false },
    district: 'Tumkur', village: 'Sira',
    budget: { min: 8000, max: 12000 },
    duration: { value: 20, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 2,
    title: 'Electrician needed – Motor installation for bore well',
    description: 'Need a licensed electrician to install a 5HP submersible pump motor and do the wiring from the main panel. 2-day work in Hassan.',
    requirementType: 'specialist',
    specialistNeeded: { specialization: 'electrician', qualificationLevel: 'certified' },
    district: 'Hassan', village: 'Alur',
    budget: { min: 1500, max: 2500 },
    duration: { value: 2, unit: 'days' },
    isUrgent: true,
  },
  {
    seekerIdx: 3,
    title: 'Wedding sound system + operator – Kolar',
    description: 'Need a professional sound system (1000–2000W) with operator for a wedding on 15th July. Hall size approx 5000 sqft.',
    requirementType: 'bundle',
    equipmentNeeded: { category: 'sound_system', quantity: 1, withOperator: true },
    district: 'Kolar', village: 'Bangarpet',
    budget: { min: 5000, max: 8000 },
    duration: { value: 1, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 0,
    title: 'Agronomist for soil testing and crop planning',
    description: 'Our 12-acre sugarcane farm has shown reduced yield for 2 consecutive seasons. Looking for a qualified agronomist for soil testing and corrective crop plan.',
    requirementType: 'specialist',
    specialistNeeded: { specialization: 'agronomist', qualificationLevel: 'engineer' },
    district: 'Mandya', village: 'Nagamangala',
    budget: { min: 3000, max: 6000 },
    duration: { value: 3, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 1,
    title: 'Combine harvester needed – paddy harvest Tumkur',
    description: 'Paddy crop ready for harvest across 20 acres. Looking for combine harvester + operator for 3–4 days. Need before next rainfall.',
    requirementType: 'bundle',
    equipmentNeeded: { category: 'harvester', quantity: 1, withOperator: true },
    specialistNeeded: { specialization: 'harvester_operator', qualificationLevel: 'any' },
    district: 'Tumkur', village: 'Tiptur',
    budget: { min: 18000, max: 25000 },
    duration: { value: 4, unit: 'days' },
    isUrgent: true,
  },
  {
    seekerIdx: 2,
    title: 'Mason needed for cattle shed repair – Hassan',
    description: 'Old cattle shed wall collapsed after heavy rain. Need a mason to rebuild using local stone/brick. Estimated 5 days work. Material will be arranged.',
    requirementType: 'specialist',
    specialistNeeded: { specialization: 'mason', qualificationLevel: 'any' },
    district: 'Hassan', village: 'Belur',
    budget: { min: 3000, max: 4000 },
    duration: { value: 5, unit: 'days' },
    isUrgent: true,
  },
  {
    seekerIdx: 3,
    title: 'Generator for 2-day event – Kolar Gold Fields',
    description: 'Annual village fair requires 5–10 KVA generator backup for 2 days. Lights, speakers, and food stalls to be powered.',
    requirementType: 'equipment',
    equipmentNeeded: { category: 'generator', quantity: 1, withOperator: false },
    district: 'Kolar', village: 'Kolar Gold Fields',
    budget: { min: 4000, max: 6000 },
    duration: { value: 2, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 0,
    title: 'Cattle vaccination camp – 50 cows Mandya',
    description: 'Planning a cattle health camp for our farmer cooperative. Need a licensed animal health worker for FMD and BQ vaccination for approx. 50 cattle.',
    requirementType: 'specialist',
    specialistNeeded: { specialization: 'animal_health_worker', qualificationLevel: 'certified' },
    district: 'Mandya', village: 'Maddur',
    budget: { min: 2000, max: 4000 },
    duration: { value: 1, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 1,
    title: 'Drip irrigation layout – tomato farm Tumkur',
    description: 'New 3-acre tomato farm needs a complete drip irrigation system installed with fertigation tank. Looking for an experienced irrigation technician or agronomist.',
    requirementType: 'specialist',
    specialistNeeded: { specialization: 'pump_mechanic', qualificationLevel: 'any' },
    district: 'Tumkur', village: 'Madhugiri',
    budget: { min: 5000, max: 9000 },
    duration: { value: 4, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 2,
    title: "Tent structure for daughter's wedding – Hassan",
    description: 'Function is on 20th Aug. Need a large tent (at least 40×60 ft) for 300 guests. Venue is open ground near Sakleshpur. Setup day before required.',
    requirementType: 'equipment',
    equipmentNeeded: { category: 'tent_structure', quantity: 1, withOperator: false },
    district: 'Hassan', village: 'Sakleshpur',
    budget: { min: 8000, max: 14000 },
    duration: { value: 2, unit: 'days' },
    isUrgent: false,
  },
  {
    seekerIdx: 3,
    title: 'Power sprayer needed – pest attack on paddy crop',
    description: 'Stem borer attack on 6-acre paddy. Need a power sprayer immediately for chemical application. Can arrange chemicals myself.',
    requirementType: 'equipment',
    equipmentNeeded: { category: 'sprayer', quantity: 1, withOperator: false },
    district: 'Kolar', village: 'Bangarpet',
    budget: { min: 600, max: 1200 },
    duration: { value: 2, unit: 'days' },
    isUrgent: true,
  },
];

// ─── BOOKINGS (15 records) ────────────────────────────────────────────────────
// Built dynamically after equipment + specialists are created
function makeBookings(seekers, equipment, specialists, providers) {
  const now = new Date();
  const past = (d) => new Date(now - d * 86400000);
  const future = (d) => new Date(now.getTime() + d * 86400000);

  return [
    // Completed
    {
      seeker: seekers[0]._id, bookingType: 'bundle',
      equipment: equipment[0]._id, equipmentOwner: providers[0]._id,
      specialist: specialists[0]._id,
      startDate: past(20), endDate: past(17),
      location: { district: 'Mandya', village: 'Kirugavalu', state: 'Karnataka' },
      purpose: 'Paddy field ploughing and harrowing before sowing',
      status: 'completed',
      pricing: { equipmentCost: 6600, specialistCost: 2100, platformFee: 435, totalAmount: 9135, isPaid: true, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[1]._id, bookingType: 'equipment_only',
      equipment: equipment[3]._id, equipmentOwner: providers[2]._id,
      startDate: past(15), endDate: past(5),
      location: { district: 'Tumkur', village: 'Sira', state: 'Karnataka' },
      purpose: 'Irrigation of tomato crops during dry period',
      status: 'completed',
      pricing: { equipmentCost: 5000, specialistCost: 0, platformFee: 250, totalAmount: 5250, isPaid: true, paymentMethod: 'upi' },
    },
    {
      seeker: seekers[2]._id, bookingType: 'specialist_only',
      specialist: specialists[1]._id,
      startDate: past(10), endDate: past(9),
      location: { district: 'Hassan', village: 'Alur', state: 'Karnataka' },
      purpose: 'Motor winding and panel installation for bore well pump',
      status: 'completed',
      pricing: { equipmentCost: 0, specialistCost: 1800, platformFee: 90, totalAmount: 1890, isPaid: true, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[0]._id, bookingType: 'bundle',
      equipment: equipment[2]._id, equipmentOwner: providers[1]._id,
      specialist: specialists[6]._id,
      startDate: past(8), endDate: past(5),
      location: { district: 'Mandya', village: 'Maddur', state: 'Karnataka' },
      purpose: 'Paddy harvest – 15 acres',
      status: 'completed',
      pricing: { equipmentCost: 16500, specialistCost: 2550, platformFee: 953, totalAmount: 20003, isPaid: true, paymentMethod: 'bank_transfer' },
    },
    {
      seeker: seekers[3]._id, bookingType: 'equipment_only',
      equipment: equipment[5]._id, equipmentOwner: providers[2]._id,
      startDate: past(6), endDate: past(5),
      location: { district: 'Kolar', village: 'Bangarpet', state: 'Karnataka' },
      purpose: 'Annual function sound system',
      status: 'completed',
      pricing: { equipmentCost: 3500, specialistCost: 0, platformFee: 175, totalAmount: 3675, isPaid: true, paymentMethod: 'cash' },
    },

    // Confirmed (upcoming)
    {
      seeker: seekers[1]._id, bookingType: 'bundle',
      equipment: equipment[1]._id, equipmentOwner: providers[0]._id,
      specialist: specialists[0]._id,
      startDate: future(2), endDate: future(5),
      location: { district: 'Tumkur', village: 'Tiptur', state: 'Karnataka' },
      purpose: 'Paddy ploughing before transplanting season',
      status: 'confirmed',
      pricing: { equipmentCost: 11200, specialistCost: 2800, platformFee: 700, totalAmount: 14700, isPaid: false, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[2]._id, bookingType: 'specialist_only',
      specialist: specialists[5]._id,
      startDate: future(3), endDate: future(5),
      location: { district: 'Hassan', village: 'Alur', state: 'Karnataka' },
      purpose: 'Soil health testing and crop planning for next season',
      status: 'confirmed',
      pricing: { equipmentCost: 0, specialistCost: 4500, platformFee: 225, totalAmount: 4725, isPaid: false, paymentMethod: 'upi' },
    },
    {
      seeker: seekers[0]._id, bookingType: 'equipment_only',
      equipment: equipment[7]._id, equipmentOwner: providers[1]._id,
      startDate: future(1), endDate: future(3),
      location: { district: 'Mandya', village: 'Kirugavalu', state: 'Karnataka' },
      purpose: 'Soil preparation with rotavator for vegetable crop',
      status: 'confirmed',
      pricing: { equipmentCost: 3600, specialistCost: 0, platformFee: 180, totalAmount: 3780, isPaid: false, paymentMethod: 'cash' },
    },

    // Pending
    {
      seeker: seekers[3]._id, bookingType: 'bundle',
      equipment: equipment[12]._id, equipmentOwner: providers[2]._id,
      specialist: specialists[0]._id,
      startDate: future(7), endDate: future(8),
      location: { district: 'Kolar', village: 'Kolar Gold Fields', state: 'Karnataka' },
      purpose: 'Wedding function sound and event management',
      status: 'pending',
      pricing: { equipmentCost: 7000, specialistCost: 1400, platformFee: 420, totalAmount: 8820, isPaid: false, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[1]._id, bookingType: 'specialist_only',
      specialist: specialists[3]._id,
      startDate: future(5), endDate: future(9),
      location: { district: 'Tumkur', village: 'Sira', state: 'Karnataka' },
      purpose: 'Farm shed wall rebuilding after storm damage',
      status: 'pending',
      pricing: { equipmentCost: 0, specialistCost: 3250, platformFee: 163, totalAmount: 3413, isPaid: false, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[2]._id, bookingType: 'equipment_only',
      equipment: equipment[11]._id, equipmentOwner: providers[3]._id,
      startDate: future(10), endDate: future(11),
      location: { district: 'Hassan', village: 'Belur', state: 'Karnataka' },
      purpose: 'Concrete mixing for dairy shed flooring work',
      status: 'pending',
      pricing: { equipmentCost: 1600, specialistCost: 0, platformFee: 80, totalAmount: 1680, isPaid: false, paymentMethod: 'cash' },
    },

    // In Progress
    {
      seeker: seekers[0]._id, bookingType: 'specialist_only',
      specialist: specialists[9]._id,
      startDate: past(1), endDate: future(0),
      location: { district: 'Mandya', village: 'Maddur', state: 'Karnataka' },
      purpose: 'FMD and BQ vaccination for cattle cooperative',
      status: 'in_progress',
      pricing: { equipmentCost: 0, specialistCost: 2000, platformFee: 100, totalAmount: 2100, isPaid: false, paymentMethod: 'cash' },
    },
    {
      seeker: seekers[3]._id, bookingType: 'bundle',
      equipment: equipment[8]._id, equipmentOwner: providers[3]._id,
      specialist: specialists[0]._id,
      startDate: past(1), endDate: future(1),
      location: { district: 'Kolar', village: 'Bangarpet', state: 'Karnataka' },
      purpose: 'Spraying pesticide on paddy stem borer attack',
      status: 'in_progress',
      pricing: { equipmentCost: 900, specialistCost: 1400, platformFee: 115, totalAmount: 2415, isPaid: false, paymentMethod: 'cash' },
    },

    // Cancelled
    {
      seeker: seekers[2]._id, bookingType: 'equipment_only',
      equipment: equipment[4]._id, equipmentOwner: providers[3]._id,
      startDate: past(5), endDate: past(4),
      location: { district: 'Hassan', village: 'Alur', state: 'Karnataka' },
      purpose: 'Generator for Ganesha festival function',
      status: 'cancelled',
      cancellationReason: 'Owner had a prior commitment and could not deliver',
      pricing: { equipmentCost: 2400, specialistCost: 0, platformFee: 120, totalAmount: 2520, isPaid: false },
    },
    {
      seeker: seekers[1]._id, bookingType: 'specialist_only',
      specialist: specialists[4]._id,
      startDate: past(3), endDate: past(2),
      location: { district: 'Tumkur', village: 'Madhugiri', state: 'Karnataka' },
      purpose: 'Gate fabrication for farm entry',
      status: 'cancelled',
      cancellationReason: 'Seeker found local welder at lower cost',
      pricing: { equipmentCost: 0, specialistCost: 1400, platformFee: 70, totalAmount: 1470, isPaid: false },
    },
  ];
}

// ─── RATINGS (for completed bookings) ─────────────────────────────────────────
function makeRatings(bookings, seekers, equipment, specialists) {
  const completedBookings = bookings.filter(b => b.status === 'completed');
  return [
    {
      booking: completedBookings[0]._id, ratedBy: seekers[0]._id,
      ratingType: 'equipment', targetEquipment: equipment[0]._id,
      score: 5, equipmentConditionScore: 5, equipmentReliabilityScore: 5,
      review: 'Excellent tractor. Very well maintained. Operator was punctual and professional. Completed ploughing of 8 acres in 2.5 days.',
    },
    {
      booking: completedBookings[0]._id, ratedBy: seekers[0]._id,
      ratingType: 'specialist', targetSpecialist: specialists[0]._id,
      score: 5, specialistSkillScore: 5, specialistPunctualityScore: 5, specialistCommunicationScore: 4,
      review: 'Shiva Kumar is very skilled. He understood the field conditions well and adjusted depth appropriately. Will hire again.',
    },
    {
      booking: completedBookings[1]._id, ratedBy: seekers[1]._id,
      ratingType: 'equipment', targetEquipment: equipment[3]._id,
      score: 4, equipmentConditionScore: 4, equipmentReliabilityScore: 4,
      review: 'Good pump. Worked reliably for 10 days. Small fuel leak noticed on day 8 but did not affect performance.',
    },
    {
      booking: completedBookings[2]._id, ratedBy: seekers[2]._id,
      ratingType: 'specialist', targetSpecialist: specialists[1]._id,
      score: 5, specialistSkillScore: 5, specialistPunctualityScore: 5, specialistCommunicationScore: 5,
      review: 'Vijay is excellent! Completed the motor installation in a single day. Very clean wiring work. BESCOM compliant.',
    },
    {
      booking: completedBookings[3]._id, ratedBy: seekers[0]._id,
      ratingType: 'equipment', targetEquipment: equipment[2]._id,
      score: 4, equipmentConditionScore: 4, equipmentReliabilityScore: 5,
      review: 'Harvester was efficient. Some delay in the morning due to dew on the crop. Otherwise smooth operation.',
    },
    {
      booking: completedBookings[3]._id, ratedBy: seekers[0]._id,
      ratingType: 'specialist', targetSpecialist: specialists[6]._id,
      score: 5, specialistSkillScore: 5, specialistPunctualityScore: 4, specialistCommunicationScore: 5,
      review: 'Very experienced operator. Handled wet paddy sections without getting stuck. Would recommend for large farms.',
    },
    {
      booking: completedBookings[4]._id, ratedBy: seekers[3]._id,
      ratingType: 'equipment', targetEquipment: equipment[5]._id,
      score: 5, equipmentConditionScore: 5, equipmentReliabilityScore: 5,
      review: 'Crystal clear sound. Covered entire hall perfectly. No distortion even at full volume. Great value for money.',
    },
  ];
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ruralxchange');
    console.log('✅  Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), Equipment.deleteMany({}), Specialist.deleteMany({}),
      Booking.deleteMany({}), Requirement.deleteMany({}), Rating.deleteMany({}),
    ]);
    console.log('🗑️   Cleared all existing data');

    // ── Create Users ──
    const createdUsers = await User.create(usersData);
    const seekers    = createdUsers.filter(u => u.role === 'seeker');
    const providers  = createdUsers.filter(u => u.role === 'provider');
    const specUsers  = createdUsers.filter(u => u.role === 'specialist');
    console.log(`👥  Created ${createdUsers.length} users  (${seekers.length} seekers · ${providers.length} providers · ${specUsers.length} specialists · 1 admin)`);

    // ── Create Equipment ──
    const eqWithOwners = equipmentData.map(({ ownerIdx, ...eq }) => ({
      ...eq,
      owner: providers[ownerIdx]._id,
      district: eq.district || providers[ownerIdx].district,
      village:  eq.village  || providers[ownerIdx].village,
      state: 'Karnataka',
      availabilityStatus: 'available',
    }));
    const createdEquipment = await Equipment.create(eqWithOwners);
    console.log(`🚜  Created ${createdEquipment.length} equipment listings`);

    // ── Create Specialist Profiles ──
    const spWithUsers = specialistData.map(({ userIdx, ...sp }) => ({
      ...sp,
      user: specUsers[userIdx]._id,
      district: specUsers[userIdx].district,
      village:  specUsers[userIdx].village,
      state: 'Karnataka',
      availabilityStatus: 'available',
    }));
    const createdSpecialists = await Specialist.create(spWithUsers);
    console.log(`👷  Created ${createdSpecialists.length} specialist profiles`);

    // ── Create Requirements ──
    const reqWithSeekers = requirementsData.map(({ seekerIdx, ...req }) => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 14);
      return { ...req, postedBy: seekers[seekerIdx]._id, expiresAt: expiry, status: 'open' };
    });
    const createdRequirements = await Requirement.create(reqWithSeekers);
    console.log(`📋  Created ${createdRequirements.length} requirements`);

    // ── Create Bookings ──
    const bookingsPayload = makeBookings(seekers, createdEquipment, createdSpecialists, providers);
    const createdBookings = await Booking.create(bookingsPayload);
    console.log(`📅  Created ${createdBookings.length} bookings`);

    // ── Create Ratings ──
    const ratingsPayload = makeRatings(createdBookings, seekers, createdEquipment, createdSpecialists);
    const createdRatings = await Rating.create(ratingsPayload);
    console.log(`⭐  Created ${createdRatings.length} ratings`);

    // ── Print Summary ──
    console.log('\n' + '═'.repeat(60));
    console.log('  🌾  RuralXchange Database Seeded Successfully');
    console.log('═'.repeat(60));
    console.log('\n  📋  TEST ACCOUNTS\n');
    console.log('  Role        │ Phone        │ Password   │ District');
    console.log('  ────────────┼──────────────┼────────────┼───────────────');
    console.log('  Seeker      │ 9100000001   │ pass123    │ Mandya');
    console.log('  Seeker      │ 9100000002   │ pass123    │ Tumkur');
    console.log('  Seeker      │ 9100000003   │ pass123    │ Hassan');
    console.log('  Seeker      │ 9100000004   │ pass123    │ Kolar');
    console.log('  Provider    │ 9200000001   │ pass123    │ Mandya');
    console.log('  Provider    │ 9200000002   │ pass123    │ Hassan');
    console.log('  Provider    │ 9200000003   │ pass123    │ Mysuru');
    console.log('  Provider    │ 9200000004   │ pass123    │ Davangere');
    console.log('  Specialist  │ 9300000001   │ pass123    │ Mysuru');
    console.log('  Specialist  │ 9300000002   │ pass123    │ Bengaluru Rural');
    console.log('  Specialist  │ 9300000003   │ pass123    │ Dharwad');
    console.log('  Specialist  │ 9300000004   │ pass123    │ Raichur');
    console.log('  Admin       │ 9000000000   │ admin123   │ Bengaluru Urban');
    console.log('\n  📊  SUMMARY');
    console.log(`  Users: ${createdUsers.length}  ·  Equipment: ${createdEquipment.length}  ·  Specialists: ${createdSpecialists.length}`);
    console.log(`  Bookings: ${createdBookings.length}  ·  Requirements: ${createdRequirements.length}  ·  Ratings: ${createdRatings.length}`);
    console.log('\n' + '═'.repeat(60) + '\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌  Seeding error:', err.message);
    if (err.errors) {
      Object.entries(err.errors).forEach(([k, v]) => console.error(`   ${k}: ${v.message}`));
    }
    process.exit(1);
  }
}

seedDatabase();
