/**
 * RuralXchange — Realistic 30-Day Platform Dataset Seed Engine
 * Seeds realistic Karnataka farmers, equipment providers, specialists, 
 * 30 days of booking transactions, ratings, notice board responses, and expiry alerts.
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

// ─── 1. REALISTIC USERS & PERSONAS ──────────────────────────────────────────
const usersData = [
  // 1. Admin Console
  {
    name: 'Admin Console',
    phone: '9845000000',
    email: 'admin@ruralxchange.in',
    password: 'admin123',
    role: 'admin',
    district: 'Bengaluru Urban',
    village: 'Hebbal',
    avatar: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    isVerified: true,
    preferredLanguage: 'en'
  },

  // 2. Seeker (Alert Banner): Ramesh Gowda
  {
    name: 'Ramesh Gowda',
    phone: '9845011111',
    password: 'password123',
    role: 'seeker',
    district: 'Mandya',
    village: 'Shivapura',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // 3. Equipment Provider: Suresh Patel (Belagavi - Incoming Bookings)
  {
    name: 'Suresh Patel',
    phone: '9845022222',
    password: 'password123',
    role: 'provider',
    district: 'Belagavi',
    village: 'Bailhongal',
    avatar: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // 4. Professional Specialist: Dr. Ananya Rao (Bengaluru Urban)
  {
    name: 'Dr. Ananya Rao',
    phone: '9845033333',
    password: 'password123',
    role: 'specialist',
    district: 'Bengaluru Urban',
    village: 'GKVK Campus, Yelahanka',
    avatar: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    isVerified: true,
    preferredLanguage: 'en'
  },

  // 5. Skilled Operator: Manjunath K (Mysuru)
  {
    name: 'Manjunath K',
    phone: '9845044444',
    password: 'password123',
    role: 'specialist',
    district: 'Mysuru',
    village: 'Nanjangud',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // ── Additional Seekers ──
  // 6. Seeker (Dharwad)
  {
    name: 'Basavarajappa K.',
    phone: '9845022223',
    password: 'password123',
    role: 'seeker',
    district: 'Dharwad',
    village: 'Navalgund',
    avatar: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // 7. Seeker (Vijayapura)
  {
    name: 'Ningappa Biradar',
    phone: '9845022224',
    password: 'password123',
    role: 'seeker',
    district: 'Vijayapura',
    village: 'Indi',
    avatar: { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // 8. Seeker (Belagavi)
  {
    name: 'Chennamma Patil',
    phone: '9845022225',
    password: 'password123',
    role: 'seeker',
    district: 'Belagavi',
    village: 'Bailhongal',
    avatar: { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // 9. Seeker (Tumakuru)
  {
    name: 'Revanna Siddappa',
    phone: '9845022226',
    password: 'password123',
    role: 'seeker',
    district: 'Tumakuru',
    village: 'Tiptur',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    isVerified: true,
    preferredLanguage: 'kn'
  },

  // ── Additional Providers ──
  // 10. Provider Mandya (Manjunath H.K. - providerIdx: 1)
  {
    name: 'Manjunath H.K.',
    phone: '9845033334',
    password: 'password123',
    role: 'provider',
    district: 'Mandya',
    village: 'Maddur',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    isVerified: true
  },

  // 11. Provider Dharwad (Basavaraj Patil - providerIdx: 2)
  {
    name: 'Basavaraj Patil',
    phone: '9845044445',
    password: 'password123',
    role: 'provider',
    district: 'Dharwad',
    village: 'Hubballi Rural',
    avatar: { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    isVerified: true
  },

  // 12. Provider Mysuru (Mahadeva Swamy - providerIdx: 3)
  {
    name: 'Mahadeva Swamy',
    phone: '9845044446',
    password: 'password123',
    role: 'provider',
    district: 'Mysuru',
    village: 'Nanjangud',
    avatar: { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    isVerified: true
  },

  // 13. Provider Davangere (Kalleshappa Nayak - providerIdx: 4)
  {
    name: 'Kalleshappa Nayak',
    phone: '9845044447',
    password: 'password123',
    role: 'provider',
    district: 'Davangere',
    village: 'Harihara',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    isVerified: true
  },

  // 14. Provider Ballari (Mallikarjun Reddy - providerIdx: 5)
  {
    name: 'Mallikarjun Reddy',
    phone: '9845044448',
    password: 'password123',
    role: 'provider',
    district: 'Ballari',
    village: 'Siruguppa',
    avatar: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    isVerified: true
  },

  // 15. Provider Uttara Kannada (Chandrashekhar Hegde - providerIdx: 6)
  {
    name: 'Chandrashekhar Hegde',
    phone: '9845044449',
    password: 'password123',
    role: 'provider',
    district: 'Uttara Kannada',
    village: 'Sirsi',
    avatar: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    isVerified: true
  },

  // 16. Provider Kalaburagi (Gowdappa Desai - providerIdx: 7)
  {
    name: 'Gowdappa Desai',
    phone: '9845044450',
    password: 'password123',
    role: 'provider',
    district: 'Kalaburagi',
    village: 'Aland',
    avatar: { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    isVerified: true
  },

  // 17. Provider Udupi / Coastal (Shashidhar Shetty - providerIdx: 8)
  {
    name: 'Shashidhar Shetty',
    phone: '9845044451',
    password: 'password123',
    role: 'provider',
    district: 'Udupi',
    village: 'Kundapura',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    isVerified: true
  },

  // 18. Provider Kolar (Prasad Reddy - providerIdx: 9)
  {
    name: 'Prasad Reddy',
    phone: '9845044452',
    password: 'password123',
    role: 'provider',
    district: 'Kolar',
    village: 'Mulbagal',
    avatar: { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    isVerified: true
  },

  // 19. Provider Hassan (Veeranna Gowda - providerIdx: 10)
  {
    name: 'Veeranna Gowda',
    phone: '9845044453',
    password: 'password123',
    role: 'provider',
    district: 'Hassan',
    village: 'Channarayapatna',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    isVerified: true
  },

  // ── Additional Specialists ──
  // 20. Specialist: Venkatesh Kumar (Harvester Operator - specUserIdx: 2)
  {
    name: 'Venkatesh Kumar',
    phone: '9845055555',
    password: 'password123',
    role: 'specialist',
    district: 'Mandya',
    village: 'Pandavapura',
    avatar: { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
    isVerified: true
  },

  // 21. Specialist: Dr. Anand Kulkarni (Senior Agronomist - specUserIdx: 3)
  {
    name: 'Dr. Anand Kulkarni',
    phone: '9845066666',
    password: 'password123',
    role: 'specialist',
    district: 'Mysuru',
    village: 'Varuna',
    avatar: { url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150' },
    isVerified: true
  },

  // 22. Specialist: Naveen Acharya (Rural Electrician - specUserIdx: 4)
  {
    name: 'Naveen Acharya',
    phone: '9845077777',
    password: 'password123',
    role: 'specialist',
    district: 'Tumakuru',
    village: 'Sira',
    avatar: { url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150' },
    isVerified: true
  },

  // 23. Specialist: Shivaraj Gowda (Tractor Driver - specUserIdx: 5)
  {
    name: 'Shivaraj Gowda',
    phone: '9845088881',
    password: 'password123',
    role: 'specialist',
    district: 'Hassan',
    village: 'Channarayapatna',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    isVerified: true
  },

  // 24. Specialist: Er. Girish Murthy (Civil Engineer - specUserIdx: 6)
  {
    name: 'Er. Girish Murthy',
    phone: '9845088882',
    password: 'password123',
    role: 'specialist',
    district: 'Bengaluru Rural',
    village: 'Doddaballapura',
    avatar: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    isVerified: true
  },

  // 25. Specialist: Dr. Preeti Hebbar (Animal Health Worker - specUserIdx: 7)
  {
    name: 'Dr. Preeti Hebbar',
    phone: '9845088883',
    password: 'password123',
    role: 'specialist',
    district: 'Shivamogga',
    village: 'Bhadravati',
    avatar: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    isVerified: true
  },

  // 26. Specialist: Subhash Pujari (Pump Mechanic - specUserIdx: 8)
  {
    name: 'Subhash Pujari',
    phone: '9845088884',
    password: 'password123',
    role: 'specialist',
    district: 'Belagavi',
    village: 'Gokak',
    avatar: { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    isVerified: true
  },

  // 27. Specialist: Muniswamy Mason (Mason - specUserIdx: 9)
  {
    name: 'Muniswamy Mason',
    phone: '9845088885',
    password: 'password123',
    role: 'specialist',
    district: 'Kolar',
    village: 'Bangarapet',
    avatar: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    isVerified: true
  },

  // 28. Specialist: Kiran Kumar Welder (Welder - specUserIdx: 10)
  {
    name: 'Kiran Kumar Welder',
    phone: '9845088886',
    password: 'password123',
    role: 'specialist',
    district: 'Davangere',
    village: 'Harihara',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    isVerified: true
  },

  // 29. Specialist: Lokesh Gowda Plumber (Plumber - specUserIdx: 11)
  {
    name: 'Lokesh Gowda Plumber',
    phone: '9845088887',
    password: 'password123',
    role: 'specialist',
    district: 'Chamarajanagar',
    village: 'Gundlupet',
    avatar: { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    isVerified: true
  },

  // 30. Specialist: Ranganath Woodcraft (Carpenter - specUserIdx: 12)
  {
    name: 'Ranganath Woodcraft',
    phone: '9845088888',
    password: 'password123',
    role: 'specialist',
    district: 'Chikkamagaluru',
    village: 'Mudigere',
    avatar: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    isVerified: true
  },

  // 31. Specialist: Govindappa Field Hand (Senior Harvest Hand - specUserIdx: 13)
  {
    name: 'Govindappa Field Hand',
    phone: '9845088889',
    password: 'password123',
    role: 'specialist',
    district: 'Raichur',
    village: 'Manvi',
    avatar: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    isVerified: true
  }
];

// ─── 2. REALISTIC EQUIPMENT INVENTORY (ALL 24 CATEGORIES) ─────────────────────
const equipmentData = [
  // 1. TRACTORS
  {
    providerIdx: 1,
    title: 'Mahindra 575 DI Sarpanch 45HP Tractor',
    category: 'tractor',
    description: '45 HP 4-cylinder engine, power steering, dual clutch with rotavator attachment. Excellent condition for ploughing and wet land tilling.',
    condition: 'excellent',
    pricePerDay: 1800,
    pricePerHour: 250,
    district: 'Mandya',
    village: 'Maddur',
    address: 'Near Old Bus Stand, Shivapura Post, Maddur Taluk',
    lat: 12.5844, lng: 77.0450,
    images: [{ url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600' }],
    specifications: { brand: 'Mahindra', model: '575 DI', year: 2022, horsePower: 45, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver']
  },
  {
    providerIdx: 0,
    title: 'John Deere 5050D 50HP Heavy Duty 4WD Tractor',
    category: 'tractor',
    description: 'Top condition 50HP John Deere tractor with power steering and heavy disc plough. Ideal for black cotton soil cultivation in Belagavi & Dharwad.',
    condition: 'excellent',
    pricePerDay: 2400,
    pricePerHour: 320,
    district: 'Belagavi',
    village: 'Bailhongal',
    address: 'APMC Yard, Bailhongal',
    lat: 15.8167, lng: 74.8667,
    images: [{ url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600' }],
    specifications: { brand: 'John Deere', model: '5050D', year: 2023, horsePower: 50, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver']
  },
  {
    providerIdx: 4,
    title: 'Swaraj 744 FE 48HP Multi-Speed Tractor',
    category: 'tractor',
    description: '48 HP high torque tractor with reverse PTO. Best for sugarcane haulage, thresher operation, and deep tillage.',
    condition: 'good',
    pricePerDay: 1900,
    pricePerHour: 260,
    district: 'Davangere',
    village: 'Harihara',
    address: 'APMC Market Yard, Harihara',
    lat: 14.5126, lng: 75.8042,
    images: [{ url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600' }],
    specifications: { brand: 'Swaraj', model: '744 FE', year: 2021, horsePower: 48, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver']
  },

  // 2. HARVESTERS
  {
    providerIdx: 1,
    title: 'Kubota DC-68G Multi-Crop Combine Harvester',
    category: 'harvester',
    description: 'Track-type combine harvester ideal for waterlogged paddy fields and sugarcane harvesting. High output 2.5 acres/hour with minimal grain loss.',
    condition: 'excellent',
    pricePerDay: 5500,
    pricePerHour: 800,
    district: 'Mandya',
    village: 'Pandavapura',
    address: 'Sugar Mill Road, Pandavapura',
    lat: 12.4984, lng: 76.6717,
    images: [{ url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600' }],
    specifications: { brand: 'Kubota', model: 'DC-68G', year: 2023, horsePower: 68, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['harvester_operator']
  },
  {
    providerIdx: 5,
    title: 'Preet 987 Self Propelled Combine Harvester with AC Cabin',
    category: 'harvester',
    description: '101 HP heavy duty straw combine harvester for Paddy, Wheat, and Sunflower across Tungabhadra river basin.',
    condition: 'excellent',
    pricePerDay: 6200,
    pricePerHour: 900,
    district: 'Ballari',
    village: 'Siruguppa',
    address: 'Kavital Road, Siruguppa',
    lat: 15.6331, lng: 76.8947,
    images: [{ url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600' }],
    specifications: { brand: 'Preet', model: '987', year: 2022, horsePower: 101, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['harvester_operator']
  },

  // 3. ROTAVATOR
  {
    providerIdx: 0,
    title: 'Sonalika 42-Blade Rotary Tiller (Rotavator)',
    category: 'rotavator',
    description: 'Heavy duty 6-feet rotavator with boron steel L-blades. Perfect for sugarcane and maize seedbed preparation in single pass.',
    condition: 'good',
    pricePerDay: 1200,
    district: 'Belagavi',
    village: 'Bailhongal',
    address: 'Old Toll Gate Road, Bailhongal',
    lat: 15.8167, lng: 74.8667,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'Sonalika', model: 'Rotamax 6ft', year: 2022, fuelType: 'diesel' }
  },
  {
    providerIdx: 10,
    title: 'Shaktiman Semi-Champion 5-ft Rotavator',
    category: 'rotavator',
    description: 'Multi-speed gearbox rotavator designed for wet paddy puddling and secondary tillage in coconut groves.',
    condition: 'excellent',
    pricePerDay: 1100,
    district: 'Hassan',
    village: 'Channarayapatna',
    address: 'BM Road, Channarayapatna',
    lat: 12.9062, lng: 76.3888,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'Shaktiman', model: 'SC-160', year: 2023, fuelType: 'diesel' }
  },

  // 4. CULTIVATOR / PLOUGH
  {
    providerIdx: 7,
    title: 'Khedut 9-Tyne Spring Loaded Heavy Cultivator',
    category: 'cultivator',
    description: 'Heavy duty spring loaded tiller for breaking hard pan, deep aeration, and root removal in dryland cotton/pulses.',
    condition: 'excellent',
    pricePerDay: 750,
    district: 'Vijayapura',
    village: 'Indi',
    address: 'Station Road, Indi',
    lat: 17.1770, lng: 75.9592,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'Khedut', model: '9-Tyne Spring', year: 2022, fuelType: 'manual' }
  },
  {
    providerIdx: 0,
    title: 'Lemken 2-Bottom Hydraulic Reversible MB Plough',
    category: 'cultivator',
    description: 'High precision reversible mouldboard plough for complete soil inversion and weed burial.',
    condition: 'good',
    pricePerDay: 1400,
    district: 'Belagavi',
    village: 'Bailhongal',
    address: 'Near Old Toll Gate, Bailhongal',
    lat: 15.8167, lng: 74.8667,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'Lemken', model: 'Opal 090', year: 2021, fuelType: 'manual' }
  },

  // 5. SEED DRILL / PLANTER
  {
    providerIdx: 7,
    title: 'National Zero Till Multi-Crop Seed Cum Fertilizer Drill',
    category: 'seed_drill',
    description: '9-row automatic seed drill with fluted roller metering mechanism for Ragi, Gram, Jowar, and Safflower.',
    condition: 'excellent',
    pricePerDay: 1300,
    district: 'Kalaburagi',
    village: 'Aland',
    address: 'Gulbarga-Aland Road, Aland',
    lat: 17.5647, lng: 76.5714,
    images: [{ url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600' }],
    specifications: { brand: 'National', model: 'ZT-9 Row', year: 2022, fuelType: 'manual' }
  },
  {
    providerIdx: 2,
    title: 'Pneumatic Precision Maize & Cotton Planter',
    category: 'seed_drill',
    description: 'Vacuum disc precision planter ensuring uniform seed spacing and fertilizer placement for maximum yield.',
    condition: 'excellent',
    pricePerDay: 2000,
    district: 'Dharwad',
    village: 'Navalgund',
    address: 'APMC Market Yard, Navalgund',
    lat: 15.5647, lng: 75.3647,
    images: [{ url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600' }],
    specifications: { brand: 'Dasmesh', model: 'Pneumatic 4-Row', year: 2023, fuelType: 'manual' }
  },

  // 6. STRAW BALER
  {
    providerIdx: 1,
    title: 'New Holland BC5060 Heavy Rectangular Straw Baler',
    category: 'baler',
    description: 'High capacity square baler for paddy straw, sugarcane trash, and maize stalks. Compresses straw into 25kg tight transport bales.',
    condition: 'excellent',
    pricePerDay: 4800,
    pricePerHour: 700,
    district: 'Mandya',
    village: 'Srirangapatna',
    address: 'Bangalore-Mysore Highway, Srirangapatna',
    lat: 12.4224, lng: 76.6946,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'New Holland', model: 'BC5060', year: 2023, horsePower: 55, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver']
  },
  {
    providerIdx: 0,
    title: 'Shaktiman Round Straw Baler with Auto Binding',
    category: 'baler',
    description: 'Tractor PTO operated round baler with automatic twine tie system. Picks 15-20 bales per hour directly from sugarcane and paddy swath.',
    condition: 'good',
    pricePerDay: 3800,
    district: 'Belagavi',
    village: 'Bailhongal',
    address: 'Near Rice Mill Colony, Bailhongal',
    lat: 15.8167, lng: 74.8667,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'Shaktiman', model: 'SRB-60', year: 2022, fuelType: 'diesel' }
  },

  // 7. CHAFF CUTTER
  {
    providerIdx: 7,
    title: 'Kalsi 3HP Commercial Automatic Chaff Cutter / Grass Shredder',
    category: 'chaff_cutter',
    description: 'Heavy duty dairy fodder cutter. Chops green grass, maize stalks, and dry fodder into digestible 0.5-inch pieces.',
    condition: 'excellent',
    pricePerDay: 500,
    district: 'Shivamogga',
    village: 'Bhadravati',
    address: 'Paper Town Road, Bhadravati',
    lat: 13.8409, lng: 75.7032,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Kalsi', model: 'CC-3HP', year: 2023, horsePower: 3, fuelType: 'electric' }
  },
  {
    providerIdx: 2,
    title: 'Fieldking Tractor PTO Heavy Silage Chaff Cutter',
    category: 'chaff_cutter',
    description: 'High throughput silage maker with blower chute for direct trolley loading. Chops up to 4 tonnes/hour.',
    condition: 'good',
    pricePerDay: 1200,
    district: 'Chamarajanagar',
    village: 'Gundlupet',
    address: 'Ooty Road, Gundlupet',
    lat: 11.8083, lng: 76.6897,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Fieldking', model: 'Silage King', year: 2022, fuelType: 'diesel' }
  },

  // 8. POWER WEEDER
  {
    providerIdx: 6,
    title: 'Honda FJ500 5.5HP Petrol Inter-Cultivator & Power Weeder',
    category: 'power_weeder',
    description: 'Compact petrol power weeder with adjustable tilling width for arecanut, coffee estates, vegetables, and ginger fields.',
    condition: 'excellent',
    pricePerDay: 850,
    district: 'Chikkamagaluru',
    village: 'Mudigere',
    address: 'Kottigehara Cross, Mudigere',
    lat: 13.1362, lng: 75.6414,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'Honda', model: 'FJ500', year: 2023, horsePower: 5.5, fuelType: 'petrol' }
  },
  {
    providerIdx: 1,
    title: 'VST Shakti 7HP Rotary Power Weeder',
    category: 'power_weeder',
    description: 'Diesel power weeder with rear rotary blades for sugarcane inter-row de-weeding and soil earthing up.',
    condition: 'good',
    pricePerDay: 950,
    district: 'Mandya',
    village: 'Nagamangala',
    address: 'Bellur Cross, Nagamangala',
    lat: 12.8188, lng: 76.7570,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'VST Shakti', model: 'FT 70', year: 2022, horsePower: 7, fuelType: 'diesel' }
  },

  // 9. POWER SPRAYER
  {
    providerIdx: 1,
    title: 'STIHL SR 450 14L Power Mistblower & Sprayer',
    category: 'sprayer',
    description: 'Backpack 2-stroke petrol mistblower for pesticide spraying in arecanut, paddy, and horticultural crops. 12m vertical reach.',
    condition: 'excellent',
    pricePerDay: 450,
    district: 'Mandya',
    village: 'Nagamangala',
    address: 'Bellur Cross, Nagamangala',
    lat: 12.8188, lng: 76.7570,
    images: [{ url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600' }],
    specifications: { brand: 'STIHL', model: 'SR 450', year: 2023, fuelType: 'petrol' }
  },
  {
    providerIdx: 9,
    title: 'ASPEE HTP 3-Piston Tractor Mounted High Pressure Sprayer',
    category: 'sprayer',
    description: '600L tank capacity tractor mounted boom & gun sprayer for mango orchards, tomato crops, and sericulture mulberry.',
    condition: 'excellent',
    pricePerDay: 1100,
    district: 'Kolar',
    village: 'Mulbagal',
    address: 'National Highway 75, Mulbagal',
    lat: 13.1644, lng: 78.3957,
    images: [{ url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600' }],
    specifications: { brand: 'ASPEE', model: 'HTP-600', year: 2022, fuelType: 'diesel' }
  },

  // 10. AGRI DRONE
  {
    providerIdx: 1,
    title: 'DJI Agras T40 40L Precision Spraying Drone with RTK',
    category: 'drone',
    description: 'Commercial 40-liter agricultural spraying & spreading drone. Can cover 40 acres/day with pinpoint centimetre-level GPS accuracy.',
    condition: 'excellent',
    pricePerDay: 4500,
    pricePerHour: 750,
    district: 'Bengaluru Rural',
    village: 'Doddaballapura',
    address: 'Industrial Area Phase 1, Doddaballapura',
    lat: 13.2929, lng: 77.5427,
    images: [{ url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600' }],
    specifications: { brand: 'DJI Agras', model: 'T40', year: 2024, fuelType: 'electric' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['agronomist', 'other']
  },
  {
    providerIdx: 2,
    title: 'Garuda Kisan Drone 16L Spraying System',
    category: 'drone',
    description: 'DGCA type certified 16-liter agri drone for rapid foliar spraying in cotton, chilli, and sugarcane fields.',
    condition: 'excellent',
    pricePerDay: 3200,
    district: 'Dharwad',
    village: 'Hubballi',
    address: 'Airport Road, Hubballi',
    lat: 15.3647, lng: 75.1240,
    images: [{ url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600' }],
    specifications: { brand: 'Garuda', model: 'Kisan-16', year: 2023, fuelType: 'electric' }
  },

  // 11. WATER PUMP
  {
    providerIdx: 1,
    title: 'Kirloskar 5HP Diesel Water Pump Set',
    category: 'water_pump',
    description: 'High discharge 5HP portable irrigation pump with 100ft suction hose and 200ft delivery pipe included. Consumes 0.9L diesel/hour.',
    condition: 'good',
    pricePerDay: 600,
    district: 'Mandya',
    village: 'Srirangapatna',
    address: 'Ganjam Post, Srirangapatna',
    lat: 12.4224, lng: 76.6946,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Kirloskar', model: 'DM-10', year: 2022, horsePower: 5, fuelType: 'diesel' }
  },
  {
    providerIdx: 6,
    title: 'Honda WB30XD 3-Inch Portable Petrol Irrigation Pump',
    category: 'water_pump',
    description: 'Ultra-lightweight self-priming 4-stroke petrol pump for river water draw, estate sprinklers, and emergency de-watering.',
    condition: 'excellent',
    pricePerDay: 500,
    district: 'Uttara Kannada',
    village: 'Sirsi',
    address: 'Yellapur Road, Sirsi',
    lat: 14.6195, lng: 74.8354,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Honda', model: 'WB30XD', year: 2023, horsePower: 4, fuelType: 'petrol' }
  },

  // 12. THRESHER
  {
    providerIdx: 3,
    title: 'Amar Multi-Crop Sugarcane & Paddy PTO Thresher',
    category: 'thresher',
    description: 'Tractor PTO driven multi-crop thresher for Ragi, Paddy, and Soybean with high purity cleaning blower.',
    condition: 'good',
    pricePerDay: 2200,
    district: 'Mysuru',
    village: 'T. Narasipura',
    address: 'Kaveri Basin Road, T. Narasipura',
    lat: 12.2131, lng: 76.9048,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'Amar Thresher', model: 'PTO-750', year: 2021, fuelType: 'diesel' }
  },
  {
    providerIdx: 7,
    title: 'Bharat Standard Multi-Crop Soybean & Gram Thresher',
    category: 'thresher',
    description: 'High recovery pulse thresher with double screening sieve. Zero grain breakage for Bengal gram and Tur dal.',
    condition: 'excellent',
    pricePerDay: 2400,
    district: 'Kalaburagi',
    village: 'Sedam',
    address: 'Sedam Industrial Belt, Sedam',
    lat: 17.1812, lng: 77.2882,
    images: [{ url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600' }],
    specifications: { brand: 'Bharat', model: 'MegaThresh 2022', year: 2022, fuelType: 'diesel' }
  },

  // 13. POWER TILLER
  {
    providerIdx: 8,
    title: 'VST Shakti 130DI 13HP Power Tiller with Rotavator & Seat',
    category: 'tiller',
    description: '13 HP multi-utility walking tractor with rotavator attachment, cage wheels, and sulky seat for wet wetland paddy cultivation.',
    condition: 'excellent',
    pricePerDay: 1100,
    district: 'Udupi',
    village: 'Kundapura',
    address: 'Main Market Road, Kundapura',
    lat: 13.6288, lng: 74.6917,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'VST Shakti', model: '130DI', year: 2023, horsePower: 13, fuelType: 'diesel' }
  },
  {
    providerIdx: 6,
    title: 'Kubota PEM140DI 14HP Walking Tractor',
    category: 'tiller',
    description: 'Direct injection diesel engine power tiller with heavy duty transmission for hillside terrace farming and areca tilling.',
    condition: 'good',
    pricePerDay: 1250,
    district: 'Dakshina Kannada',
    village: 'Puttur',
    address: 'Bolwar Main Road, Puttur',
    lat: 12.7667, lng: 75.2000,
    images: [{ url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600' }],
    specifications: { brand: 'Kubota', model: 'PEM140DI', year: 2022, horsePower: 14, fuelType: 'diesel' }
  },

  // 14. LASER LAND LEVELER
  {
    providerIdx: 5,
    title: 'Trimble Spectra Laser Land Leveler with 7ft Bucket',
    category: 'laser_leveler',
    description: 'Dual-grade transmitter, laser receiver with computerized hydraulic control box. Cuts irrigation water requirement by 30% and boosts crop uniformity.',
    condition: 'excellent',
    pricePerDay: 3500,
    pricePerHour: 500,
    district: 'Ballari',
    village: 'Siruguppa',
    address: 'Tungabhadra Canal Road, Siruguppa',
    lat: 15.6331, lng: 76.8947,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Trimble', model: 'Spectra GL722', year: 2023, fuelType: 'electric' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['tractor_driver']
  },
  {
    providerIdx: 7,
    title: 'Fieldking Hydraulic Laser Guided Land Leveler',
    category: 'laser_leveler',
    description: 'Heavy duty 8-feet high tensile steel scraper blade with European imported mast and hydraulic proportional valve.',
    condition: 'excellent',
    pricePerDay: 3200,
    district: 'Raichur',
    village: 'Sindhanur',
    address: 'Paddy Complex Road, Sindhanur',
    lat: 15.7667, lng: 76.7667,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Fieldking', model: 'LaserPro 8ft', year: 2023, fuelType: 'electric' }
  },

  // 15. EARTH AUGER / POST HOLE DIGGER
  {
    providerIdx: 6,
    title: 'Stihl BT 131 Professional Earth Auger (8" & 12" Bits)',
    category: 'earth_auger',
    description: '4-MIX petrol engine hole digger with QuickStop drill brake. Perfect for fencing poles, banana plantation, tree saplings, and foundation piling.',
    condition: 'excellent',
    pricePerDay: 800,
    district: 'Chikkamagaluru',
    village: 'Tarikere',
    address: 'Railway Feeder Road, Tarikere',
    lat: 13.7117, lng: 75.8142,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'STIHL', model: 'BT 131', year: 2023, horsePower: 1.9, fuelType: 'petrol' }
  },
  {
    providerIdx: 1,
    title: 'Tractor PTO Driven 3-Point Heavy Post Hole Digger',
    category: 'earth_auger',
    description: 'Heavy gearbox tractor post hole digger for digging 3ft deep holes in rocky red soil within 30 seconds.',
    condition: 'good',
    pricePerDay: 1500,
    district: 'Ramanagara',
    village: 'Channapatna',
    address: 'Toy City Ring Road, Channapatna',
    lat: 12.6517, lng: 77.2089,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'Fieldking', model: 'PHD-30', year: 2022, fuelType: 'diesel' }
  },

  // 16. TRACTOR TROLLEY / TRAILER
  {
    providerIdx: 1,
    title: 'Royal 5-Tonne Hydraulic Tipping Tractor Trailer',
    category: 'tractor_trolley',
    description: 'Hydraulic double-jack tipper trolley with reinforced chassis, heavy leaf springs, and high wooden sideboards for sugarcane & grain.',
    condition: 'excellent',
    pricePerDay: 900,
    district: 'Mandya',
    village: 'Maddur',
    address: 'Near Old Bus Stand, Maddur',
    lat: 12.5844, lng: 77.0450,
    images: [{ url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600' }],
    specifications: { brand: 'Royal Trailers', model: 'Hydraulic 5T', year: 2022, fuelType: 'manual' }
  },
  {
    providerIdx: 0,
    title: 'Heavy 7-Tonne Double Axle Sugarcane Haulage Trailer',
    category: 'tractor_trolley',
    description: 'Heavy duty high capacity trailer with dual axle air brakes for sugarcane transport to sugar mills in Belagavi region.',
    condition: 'good',
    pricePerDay: 1200,
    district: 'Belagavi',
    village: 'Bailhongal',
    address: 'Sugar Mill Road, Bailhongal',
    lat: 15.8167, lng: 74.8667,
    images: [{ url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600' }],
    specifications: { brand: 'Standard', model: 'Double Axle 7T', year: 2021, fuelType: 'manual' }
  },

  // 17. GENERATOR
  {
    providerIdx: 2,
    title: 'Ashoka 15kVA Silent Diesel Canopy Generator',
    category: 'generator',
    description: 'Three phase silent acoustic canopy generator with electric start. Ideal for rural weddings, temple festivals, and backup tube-well power.',
    condition: 'excellent',
    pricePerDay: 1400,
    district: 'Dharwad',
    village: 'Navalgund',
    address: 'APMC Yard Gate, Navalgund',
    lat: 15.3647, lng: 75.1240,
    images: [{ url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600' }],
    specifications: { brand: 'Ashoka Generators', model: 'KG-15', year: 2022, horsePower: 20, fuelType: 'diesel' }
  },
  {
    providerIdx: 3,
    title: 'Kirloskar 25kVA Soundproof Green Generator',
    category: 'generator',
    description: 'Heavy duty silent diesel generator for village conventions, agricultural processing units, and continuous backup.',
    condition: 'excellent',
    pricePerDay: 2200,
    district: 'Mysuru',
    village: 'Hunsur',
    address: 'Bypass Circle, Hunsur',
    lat: 12.3089, lng: 76.2928,
    images: [{ url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600' }],
    specifications: { brand: 'Kirloskar', model: 'KG1-25WS', year: 2023, horsePower: 32, fuelType: 'diesel' }
  },

  // 18. CONCRETE MIXER
  {
    providerIdx: 2,
    title: 'Schwing Stetter 10/7 CFT Hydraulic Concrete Mixer',
    category: 'concrete_mixer',
    description: 'Diesel engine concrete mixer with mechanical hopper for cattle shed construction, house foundation, and rural RCC works.',
    condition: 'good',
    pricePerDay: 1500,
    district: 'Dharwad',
    village: 'Kalghatgi',
    address: 'Forest Checkpost Road, Kalghatgi',
    lat: 15.1789, lng: 74.9740,
    images: [{ url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600' }],
    specifications: { brand: 'Schwing Stetter', model: 'CP-10', year: 2021, horsePower: 8, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['general_laborer', 'mason']
  },
  {
    providerIdx: 4,
    title: 'Safari 1-Bag Diesel Mechanical Hopper Concrete Mixer',
    category: 'concrete_mixer',
    description: 'Reliable 1-bag batch concrete mixer with water dosing tank and towing bar for easy field transit.',
    condition: 'excellent',
    pricePerDay: 1350,
    district: 'Davangere',
    village: 'Channagiri',
    address: 'Fort Road, Channagiri',
    lat: 14.0264, lng: 75.9264,
    images: [{ url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=600' }],
    specifications: { brand: 'Safari', model: '10/7 Hopper', year: 2022, horsePower: 6.5, fuelType: 'diesel' }
  },

  // 19. TENT STRUCTURE / SHAMIANA
  {
    providerIdx: 2,
    title: 'Grand Shamiana Waterproof Tent Structure (60x40 ft)',
    category: 'tent_structure',
    description: 'Waterproof decorative tent structure with steel pipes, side cloth, and carpet flooring for 300+ seating.',
    condition: 'good',
    pricePerDay: 3500,
    district: 'Dharwad',
    village: 'Kundgol',
    address: 'Cotton Market Road, Kundgol',
    lat: 15.2570, lng: 75.2530,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }],
    specifications: { brand: 'Standard Shamiana', model: '60x40 Custom', year: 2022, fuelType: 'manual' }
  },
  {
    providerIdx: 3,
    title: 'German Hanger Style Waterproof Pandal (80x50 ft)',
    category: 'tent_structure',
    description: 'Heavy duty aluminium truss waterproof event pandal structure for weddings, village fairs, and public gatherings.',
    condition: 'excellent',
    pricePerDay: 7500,
    district: 'Mysuru',
    village: 'Nanjangud',
    address: 'Temple Road, Nanjangud',
    lat: 12.1194, lng: 76.6800,
    images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600' }],
    specifications: { brand: 'German Truss', model: '80x50 Alum', year: 2023, fuelType: 'manual' }
  },

  // 20. SOUND SYSTEM
  {
    providerIdx: 1,
    title: 'Ahuja 2000W Professional Rural PA Sound System',
    category: 'sound_system',
    description: 'Ahuja amplifier, 4 column speakers, 2 reflex horn trumpets, cordless microphones, and stabilizer for village announcements & events.',
    condition: 'excellent',
    pricePerDay: 1200,
    district: 'Mandya',
    village: 'Maddur',
    address: 'Main Market Road, Maddur',
    lat: 12.5844, lng: 77.0450,
    images: [{ url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' }],
    specifications: { brand: 'Ahuja', model: 'SSA-250M Rig', year: 2023, horsePower: 2, fuelType: 'electric' }
  },
  {
    providerIdx: 10,
    title: 'JBL 1500W High Fidelity Sound Setup with Dual Bass',
    category: 'sound_system',
    description: 'High power sound system with dual 18-inch subwoofers, DJ mixing console, and digital echo processor for celebrations.',
    condition: 'excellent',
    pricePerDay: 2500,
    district: 'Hassan',
    village: 'Holenarasipura',
    address: 'Hemavathi River Road, Holenarasipura',
    lat: 12.7878, lng: 76.2417,
    images: [{ url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' }],
    specifications: { brand: 'JBL', model: 'EON 615 Pro', year: 2023, horsePower: 2, fuelType: 'electric' }
  },

  // 21. LIGHTING
  {
    providerIdx: 1,
    title: 'Event Halogen & LED Focus Flood Lighting Rig (20 Units)',
    category: 'lighting',
    description: '20 high-output 100W waterproof LED flood lights with distribution boards, 500m insulated wire, and telescopic stands.',
    condition: 'excellent',
    pricePerDay: 1000,
    district: 'Mandya',
    village: 'Pandavapura',
    address: 'Sugar Mill Road, Pandavapura',
    lat: 12.4984, lng: 76.6717,
    images: [{ url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600' }],
    specifications: { brand: 'Havells', model: 'FloodPro 100', year: 2023, horsePower: 1, fuelType: 'electric' }
  },
  {
    providerIdx: 4,
    title: 'Solar Portable High-Mast LED Mobile Light Tower',
    category: 'lighting',
    description: 'Trailer mounted 4x250W LED mobile tower with auto mast lifting up to 6 meters. Ideal for nighttime harvesting and field construction.',
    condition: 'excellent',
    pricePerDay: 2200,
    district: 'Davangere',
    village: 'Harihara',
    address: 'Tungabhadra Bridge Road, Harihara',
    lat: 14.5126, lng: 75.8042,
    images: [{ url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600' }],
    specifications: { brand: 'Tata Solar', model: 'SolarTower 1kW', year: 2023, horsePower: 1, fuelType: 'electric' }
  },

  // 22. WELDING MACHINE
  {
    providerIdx: 4,
    title: 'ESAB Heavy Inverter Arc & TIG Welding Machine (400 Amp)',
    category: 'welding_machine',
    description: 'Heavy duty portable IGBT inverter welding machine. Capable of continuous welding on tractor trolleys, cultivator shanks, and steel sheds.',
    condition: 'excellent',
    pricePerDay: 600,
    district: 'Davangere',
    village: 'Harihara',
    address: 'Industrial Estate, Harihara',
    lat: 14.5126, lng: 75.8042,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'ESAB', model: 'Arc 400i', year: 2022, horsePower: 5, fuelType: 'electric' }
  },
  {
    providerIdx: 9,
    title: 'Bosch Heavy MMA Arc Welder with Portable Inverter',
    category: 'welding_machine',
    description: 'Compact 250A welding machine for quick field repairs of gates, borewell pipes, and implement frames.',
    condition: 'good',
    pricePerDay: 450,
    district: 'Kolar',
    village: 'Bangarapet',
    address: 'Robertsonpet Main Road, KGF',
    lat: 12.9833, lng: 78.2667,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'Bosch', model: 'MMA 250', year: 2023, horsePower: 4, fuelType: 'electric' }
  },

  // 23. DRILL MACHINE
  {
    providerIdx: 1,
    title: 'Bosch GBH 8-45 DV SDS-Max Rotary Hammer Drill',
    category: 'drill',
    description: '1500W heavy rotary hammer drill with 12.5 Joules impact energy for rock drilling, RCC slab breaking, and borewell anchor bolts.',
    condition: 'excellent',
    pricePerDay: 550,
    district: 'Bengaluru Rural',
    village: 'Nelamangala',
    address: 'Tumkur Road, Nelamangala',
    lat: 13.0970, lng: 77.3917,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'Bosch', model: 'GBH 8-45 DV', year: 2023, horsePower: 2, fuelType: 'electric' }
  },
  {
    providerIdx: 3,
    title: 'Dewalt 32mm Heavy Magnetic Core Drill Machine',
    category: 'drill',
    description: 'Industrial electromagnetic base drill machine for precision hole drilling in steel purlins, tractor frames, and pump bases.',
    condition: 'good',
    pricePerDay: 700,
    district: 'Mysuru',
    village: 'Nanjangud',
    address: 'Industrial Area, Nanjangud',
    lat: 12.1194, lng: 76.6800,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' }],
    specifications: { brand: 'Dewalt', model: 'DWE1622K', year: 2022, horsePower: 2, fuelType: 'electric' }
  },

  // 24. OTHER SPECIALIZED EQUIPMENT
  {
    providerIdx: 3,
    title: 'JCB 3DX Super EcoXcellence Backhoe Loader Excavator',
    category: 'other',
    description: 'Heavy duty excavator and backhoe loader for farm land leveling, bund formation, farm pond excavation, and trenching.',
    condition: 'excellent',
    pricePerDay: 6500,
    pricePerHour: 900,
    district: 'Mysuru',
    village: 'Nanjangud',
    address: 'Industrial Area Phase 2, Nanjangud',
    lat: 12.1194, lng: 76.6800,
    images: [{ url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600' }],
    specifications: { brand: 'JCB', model: '3DX Super', year: 2022, horsePower: 76, fuelType: 'diesel' },
    requiresSpecialist: true,
    compatibleSpecialistTypes: ['other']
  },
  {
    providerIdx: 9,
    title: 'Bobcat S450 Skid Steer Loader with Hydraulic Bucket',
    category: 'other',
    description: 'Compact skid steer loader ideal for cleaning deep-litter poultry sheds, cattle manure scraping, and narrow barn alleyways.',
    condition: 'excellent',
    pricePerDay: 4200,
    district: 'Chikkaballapur',
    village: 'Sidlaghatta',
    address: 'Silk Cocoon Market Road, Sidlaghatta',
    lat: 13.3900, lng: 77.8600,
    images: [{ url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }],
    specifications: { brand: 'Bobcat', model: 'S450', year: 2023, horsePower: 49, fuelType: 'diesel' }
  }
];

// ─── 3. REALISTIC SPECIALIST PROFILES ───────────────────────────────────────
const specialistProfilesData = [
  // 0: Dr. Ananya Rao (Certified Agronomist - Bengaluru Urban)
  {
    specUserIdx: 0,
    specialization: 'agronomist',
    displayTitle: 'Senior Certified Agronomist & Crop Health Consultant',
    skills: ['Soil Testing & Nutrient Management', 'Pest Identification', 'Organic Farming Advisory', 'Drip Irrigation Planning', 'Drone Scouting'],
    experience: 8,
    pricePerDay: 1200,
    pricePerHour: 200,
    languages: ['English', 'Kannada', 'Hindi'],
    qualifications: [
      { degree: 'M.Sc Agriculture (Agronomy)', institution: 'UAS Bangalore (GKVK)', year: 2016 },
      { degree: 'ICAR Plant Protection Certification', institution: 'ICAR - Indian Agricultural Research Institute', year: 2018 }
    ],
    rating: { average: 5.0, count: 18 },
    completedJobs: 24,
    totalEarnings: 28800
  },

  // 1: Manjunath K (Tractor Driver / Skilled Operator - Mysuru)
  {
    specUserIdx: 1,
    specialization: 'tractor_driver',
    displayTitle: 'Certified Heavy Tractor & Farm Machinery Operator',
    skills: ['Tractor Driving', 'Laser Land Leveling', 'Rotavator Puddling', 'Multi-crop Deep Ploughing', 'Sugarcane Trailer Haulage'],
    experience: 7,
    pricePerDay: 800,
    pricePerHour: 120,
    languages: ['Kannada'],
    qualifications: [{ degree: 'Heavy Commercial Vehicle License', institution: 'RTO Mysuru', year: 2017 }],
    rating: { average: 4.9, count: 22 },
    completedJobs: 30,
    totalEarnings: 24000
  },

  // 2: Venkatesh Kumar (Harvester Operator - Mandya)
  {
    specUserIdx: 2,
    specialization: 'harvester_operator',
    displayTitle: 'Certified Combine Harvester Operator',
    skills: ['Combine Harvester Operation', 'Track Harvester Maintenance', 'Paddy Harvesting', 'Field Level Adjustment'],
    experience: 8,
    pricePerDay: 900,
    pricePerHour: 150,
    languages: ['Kannada', 'Telugu'],
    qualifications: [{ degree: 'Kubota Machine Operator Certificate', institution: 'Kubota India Training Institute', year: 2020 }],
    rating: { average: 4.9, count: 18 },
    completedJobs: 24,
    totalEarnings: 32400
  },

  // 3: Dr. Anand Kulkarni (Senior Agronomist - Mysuru)
  {
    specUserIdx: 3,
    specialization: 'agronomist',
    displayTitle: 'Senior Agro-Climatic & Crop Health Specialist',
    skills: ['Soil Testing & Nutrient Management', 'Pest Identification', 'Organic Farming Advisory', 'Drip Irrigation Planning', 'Drone Scouting'],
    experience: 12,
    pricePerDay: 1500,
    pricePerHour: 300,
    languages: ['Kannada', 'English', 'Hindi'],
    qualifications: [{ degree: 'M.Sc Agriculture', institution: 'UAS Bangalore (GKVK)', year: 2012 }],
    rating: { average: 5.0, count: 14 },
    completedJobs: 19,
    totalEarnings: 28500
  },

  // 4: Naveen Acharya (Rural Electrician - Tumakuru)
  {
    specUserIdx: 4,
    specialization: 'electrician',
    displayTitle: 'Licensed Rural Electrician & Borewell Specialist',
    skills: ['Borewell Starter Wiring', 'Submersible Motor Rewiring', 'Farm Shed Electrification', 'Solar Pump Inverter Repair'],
    experience: 6,
    pricePerDay: 700,
    pricePerHour: 120,
    languages: ['Kannada', 'Hindi'],
    qualifications: [{ degree: 'ITI Electrical Wireman Grade A', institution: 'Govt ITI Tumakuru', year: 2018 }],
    rating: { average: 4.8, count: 22 },
    completedJobs: 31,
    totalEarnings: 24800
  },

  // 5: Shivaraj Gowda (Tractor Driver - Hassan)
  {
    specUserIdx: 5,
    specialization: 'tractor_driver',
    displayTitle: 'Professional Heavy Tractor & Implement Driver',
    skills: ['Laser Land Leveling', 'Rotavator Puddling', 'Multi-crop Deep Ploughing', 'Sugarcane Trailer Haulage'],
    experience: 10,
    pricePerDay: 750,
    pricePerHour: 130,
    languages: ['Kannada'],
    qualifications: [{ degree: 'Heavy Commercial Vehicle License', institution: 'RTO Hassan', year: 2014 }],
    rating: { average: 4.9, count: 26 },
    completedJobs: 38,
    totalEarnings: 34200
  },

  // 6: Er. Girish Murthy (Civil Engineer - Bengaluru Rural)
  {
    specUserIdx: 6,
    specialization: 'civil_engineer',
    displayTitle: 'Rural Infrastructure & Farm Building Engineer',
    skills: ['RCC Slab Supervision', 'Farm Pond Design & Lining', 'Cattle Shed Structural Layout', 'Grain Warehouse Estimation'],
    experience: 9,
    pricePerDay: 1800,
    pricePerHour: 350,
    languages: ['Kannada', 'English'],
    qualifications: [{ degree: 'B.E. Civil Engineering', institution: 'BMS College of Engineering', year: 2015 }],
    rating: { average: 4.9, count: 11 },
    completedJobs: 15,
    totalEarnings: 27000
  },

  // 7: Dr. Preeti Hebbar (Animal Health Worker - Shivamogga)
  {
    specUserIdx: 7,
    specialization: 'animal_health_worker',
    displayTitle: 'Livestock Care & Dairy Advisory Consultant',
    skills: ['Cattle Deworming & Vaccination', 'Dairy Nutrition Formulations', 'Mastitis Treatment', 'Poultry Disease Advisory'],
    experience: 7,
    pricePerDay: 1200,
    pricePerHour: 250,
    languages: ['Kannada', 'English', 'Hindi'],
    qualifications: [{ degree: 'B.V.Sc & A.H.', institution: 'KVAFSU Shivamogga', year: 2017 }],
    rating: { average: 5.0, count: 16 },
    completedJobs: 21,
    totalEarnings: 25200
  },

  // 8: Subhash Pujari (Pump Mechanic - Belagavi)
  {
    specUserIdx: 8,
    specialization: 'pump_mechanic',
    displayTitle: 'Agricultural Borewell & Submersible Pump Specialist',
    skills: ['Submersible Pump Retrieval', 'Impeller Balancing', 'Borewell Casing Flushing', 'Diesel Engine Overhaul'],
    experience: 11,
    pricePerDay: 800,
    pricePerHour: 150,
    languages: ['Kannada', 'Marathi'],
    qualifications: [{ degree: 'ITI Diesel Mechanic', institution: 'Govt ITI Belagavi', year: 2013 }],
    rating: { average: 4.7, count: 19 },
    completedJobs: 28,
    totalEarnings: 22400
  },

  // 9: Muniswamy Mason (Mason - Kolar)
  {
    specUserIdx: 9,
    specialization: 'mason',
    displayTitle: 'Master Mason & Concrete Structure Specialist',
    skills: ['Granite Foundation Dressing', 'Water Tank Plastering', 'RCC Column Casting', 'Interlock Paver Laying'],
    experience: 14,
    pricePerDay: 850,
    languages: ['Kannada', 'Telugu', 'Tamil'],
    qualifications: [{ degree: 'Master Mason Certificate', institution: 'Karnataka Building Guild', year: 2010 }],
    rating: { average: 4.8, count: 25 },
    completedJobs: 33,
    totalEarnings: 28050
  },

  // 10: Kiran Kumar Welder (Welder - Davangere)
  {
    specUserIdx: 10,
    specialization: 'welder',
    displayTitle: 'Farm Implement & Heavy Truss Welder',
    skills: ['Tractor Trolley Chassis Welding', 'Plough Tyne Hardfacing', 'Polyhouse Truss Assembly', 'Borewell Casing Jointing'],
    experience: 8,
    pricePerDay: 750,
    languages: ['Kannada', 'Hindi'],
    qualifications: [{ degree: 'Certified Arc & TIG Welder', institution: 'ITI Davangere', year: 2016 }],
    rating: { average: 4.9, count: 17 },
    completedJobs: 22,
    totalEarnings: 16500
  },

  // 11: Lokesh Gowda Plumber (Plumber - Chamarajanagar)
  {
    specUserIdx: 11,
    specialization: 'plumber',
    displayTitle: 'Drip Irrigation & Farm Pipeline Technician',
    skills: ['Drip Venturi Installation', 'PVC & HDPE Butt Fusion Welding', 'Sand Filter Backwash Setup', 'Sprinkler System Calibration'],
    experience: 7,
    pricePerDay: 650,
    languages: ['Kannada'],
    qualifications: [{ degree: 'Micro-Irrigation Plumber Certificate', institution: 'Jain Irrigation Training Center', year: 2017 }],
    rating: { average: 4.7, count: 15 },
    completedJobs: 20,
    totalEarnings: 13000
  },

  // 12: Ranganath Woodcraft (Carpenter - Chikkamagaluru)
  {
    specUserIdx: 12,
    specialization: 'carpenter',
    displayTitle: 'Farm Shed & Heavy Timber Carpenter',
    skills: ['Wood Roof Trussing', 'Livestock Feeder Fabrication', 'Wooden Cart Restoration', 'Plywood Shuttering Setup'],
    experience: 15,
    pricePerDay: 800,
    languages: ['Kannada'],
    qualifications: [{ degree: 'Master Craftsman Guild', institution: 'Malnad Wood Guild', year: 2009 }],
    rating: { average: 4.9, count: 18 },
    completedJobs: 24,
    totalEarnings: 19200
  },

  // 13: Govindappa Field Hand (General Labourer - Raichur)
  {
    specUserIdx: 13,
    specialization: 'general_laborer',
    displayTitle: 'Experienced Field Team Leader & Harvester Hand',
    skills: ['Paddy Bundle Stacking', 'Cotton Picking', 'Sugarcane Cutting', 'Fertilizer & Manure Spreading'],
    experience: 12,
    pricePerDay: 500,
    languages: ['Kannada', 'Telugu'],
    qualifications: [],
    rating: { average: 4.8, count: 30 },
    completedJobs: 42,
    totalEarnings: 21000
  }
];

// ─── 4. NOTICE BOARD REQUIREMENTS (Past 30 Days) ────────────────────────────
const requirementsData = [
  {
    seekerIdx: 0, // Ramesh Gowda (Mandya)
    title: 'Urgent: Need 50HP Tractor with Rotavator for Sugarcane Planting',
    requirementType: 'equipment',
    category: 'tractor',
    district: 'Mandya',
    village: 'Shivapura',
    description: 'Need tractor for 2 days to prepare 4 acres of field before sugarcane setts planting. Required this weekend.',
    isUrgent: true,
    daysAgo: 3,
    responses: [
      {
        providerIdx: 1, // Manjunath H.K.
        message: 'Mahindra 575 DI available with 6-ft rotavator. Can deliver to Shivapura on Saturday morning.',
        offeredPrice: 1800,
        daysAgo: 2
      }
    ]
  },
  {
    seekerIdx: 1, // Basavarajappa K. (Dharwad)
    title: 'Seeking Soil Scientist / Agronomist for Cotton Pest Infestation',
    requirementType: 'specialist',
    category: 'agronomist',
    district: 'Dharwad',
    village: 'Navalgund',
    description: 'Cotton crop showing leaf curl and pink bollworm symptoms. Need field visit and organic chemical prescription.',
    isUrgent: false,
    daysAgo: 14,
    responses: [
      {
        specUserIdx: 0, // Dr. Ananya Rao
        message: 'Available for field inspection on Tuesday. Will bring soil EC and pH meter.',
        offeredPrice: 1200,
        daysAgo: 13
      }
    ]
  },
  {
    seekerIdx: 2, // Ningappa Biradar (Vijayapura)
    title: 'Need Agri Spraying Drone for 15 Acres Pomegranate Orchard',
    requirementType: 'equipment',
    category: 'drone',
    district: 'Vijayapura',
    village: 'Indi',
    description: 'Bacterial blight preventive spray needed across pomegranate trees. Need precision drone operator.',
    isUrgent: true,
    daysAgo: 5,
    responses: [
      {
        providerIdx: 2,
        message: 'Garuda Kisan Drone with pilot can arrive tomorrow morning 6:00 AM for early spray.',
        offeredPrice: 3200,
        daysAgo: 4
      }
    ]
  },
  {
    seekerIdx: 3, // Chennamma Patil (Belagavi)
    title: 'Looking for Heavy Straw Baler for Sugarcane Trash',
    requirementType: 'equipment',
    category: 'baler',
    district: 'Belagavi',
    village: 'Bailhongal',
    description: '10 acres of sugarcane trash needs baling to prevent open burning and sell to bio-energy plant.',
    isUrgent: false,
    daysAgo: 11,
    responses: [
      {
        providerIdx: 0, // Suresh Patel
        message: 'Shaktiman round baler ready. We can bale 10 acres in 2 working days.',
        offeredPrice: 3800,
        daysAgo: 10
      }
    ]
  },
  {
    seekerIdx: 4, // Revanna Siddappa (Tumakuru)
    title: 'Require 15kVA Diesel Generator & Shamiana for Village Temple Fair',
    requirementType: 'bundle',
    category: 'generator',
    district: 'Tumakuru',
    village: 'Tiptur',
    description: 'Annual Sri Ranganatha Jatra. Need continuous 3-phase power backup and 60x40ft pandal for 3 days.',
    isUrgent: false,
    daysAgo: 18,
    responses: [
      {
        providerIdx: 2,
        message: 'Ashoka 15kVA silent generator and 60x40ft waterproof tent structure available. Full package delivery included.',
        offeredPrice: 4500,
        daysAgo: 17
      }
    ]
  },
  {
    seekerIdx: 0,
    title: 'Need 5HP Water Pump for 3 Days Irrigation',
    requirementType: 'equipment',
    category: 'water_pump',
    district: 'Mandya',
    village: 'Shivapura',
    description: 'Canal water release scheduled. Need diesel water pump with 200ft delivery pipe.',
    isUrgent: false,
    daysAgo: 22,
    responses: []
  },
  {
    seekerIdx: 1,
    title: 'Need Concrete Mixer for Farm House Construction',
    requirementType: 'equipment',
    category: 'concrete_mixer',
    district: 'Mysuru',
    village: 'Nanjangud',
    description: 'Starting foundation work for cattle shed and grain storage unit.',
    isUrgent: false,
    daysAgo: 26,
    responses: []
  }
];

// ─── 5. MAIN SEED RUNNER ────────────────────────────────────────────────────
async function seedRealisticDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    console.log('🌱 Connecting to MongoDB database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to DB');

    // Wipe all previous dummy/sample data
    console.log('🧹 Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Equipment.deleteMany({}),
      Specialist.deleteMany({}),
      Booking.deleteMany({}),
      Requirement.deleteMany({}),
      Rating.deleteMany({})
    ]);

    // 1. Create Users
    console.log('👤 Seeding realistic user accounts...');
    const usersToInsert = usersData.map(u => {
      const coords = KARNATAKA_DISTRICT_COORDS[u.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return {
        ...u,
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] }
      };
    });
    const createdUsers = await User.create(usersToInsert);

    const seekers = createdUsers.filter(u => u.role === 'seeker');
    const providers = createdUsers.filter(u => u.role === 'provider');
    const specUsers = createdUsers.filter(u => u.role === 'specialist');

    // 2. Create Equipment
    console.log('🚜 Seeding full realistic equipment inventory (all 24 categories)...');
    const eqToInsert = equipmentData.map(({ providerIdx, lat, lng, ...eq }) => {
      const providerUser = providers[providerIdx] || providers[0];
      const fallbackCoords = KARNATAKA_DISTRICT_COORDS[eq.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      const finalLng = lng != null ? lng : fallbackCoords.lng;
      const finalLat = lat != null ? lat : fallbackCoords.lat;

      return {
        ...eq,
        owner: providerUser._id,
        state: 'Karnataka',
        location: { type: 'Point', coordinates: [finalLng, finalLat] },
        availabilityStatus: 'available',
        rating: { average: 4.8, count: 6 },
        totalBookings: 8
      };
    });
    const createdEquipment = await Equipment.create(eqToInsert);

    // 3. Create Specialists
    console.log('👷 Seeding certified specialist profiles...');
    const spToInsert = specialistProfilesData.map(({ specUserIdx, ...sp }) => {
      const user = specUsers[specUserIdx];
      const coords = KARNATAKA_DISTRICT_COORDS[user.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      return {
        ...sp,
        user: user._id,
        district: user.district,
        village: user.village,
        state: 'Karnataka',
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        availabilityStatus: 'available',
        isVerified: true
      };
    });
    const createdSpecialists = await Specialist.create(spToInsert);

    // 4. Create Past 30 Days Bookings with realistic statuses, alerts, & dynamic usage
    console.log('📅 Seeding 30 days of realistic platform booking activity...');

    const now = Date.now();
    const DAY_MS = 86400000;

    const primarySeeker = seekers[0]; // Ramesh Gowda (Mandya)
    const sureshPatel = providers[0]; // Suresh Patel (Belagavi)
    const manjunathHK = providers[1]; // Manjunath H.K. (Mandya)
    const drAnanya = specUsers[0]; // Dr. Ananya Rao
    const manjunathK = specUsers[1]; // Manjunath K

    const drAnanyaSpec = createdSpecialists[0]; // Dr. Ananya Rao Profile
    const manjunathKSpec = createdSpecialists[1]; // Manjunath K Profile

    const kubotaHarvester = createdEquipment.find(e => e.title.includes('Kubota')) || createdEquipment[3];
    const mahindraTractor = createdEquipment.find(e => e.title.includes('Mahindra 575')) || createdEquipment[0];
    const johnDeereTractor = createdEquipment.find(e => e.title.includes('John Deere')) || createdEquipment[1];
    const sonalikaRotavator = createdEquipment.find(e => e.title.includes('Sonalika')) || createdEquipment[5];
    const sugarcaneTrailer = createdEquipment.find(e => e.title.includes('Sugarcane Haulage')) || createdEquipment[17];
    const waterPump = createdEquipment.find(e => e.title.includes('Kirloskar 5HP')) || createdEquipment[10];
    const electricianSpec = createdSpecialists.find(s => s.specialization === 'electrician') || createdSpecialists[4];

    // Scenario 1: RAMESH GOWDA (9845011111) — Auto-cancelled alert popup
    await Booking.create({
      seeker: primarySeeker._id,
      bookingType: 'equipment_only',
      equipment: kubotaHarvester._id,
      equipmentOwner: manjunathHK._id,
      startDate: new Date(now + 2 * DAY_MS),
      endDate: new Date(now + 4 * DAY_MS),
      location: { district: 'Mandya', village: 'Shivapura', state: 'Karnataka' },
      purpose: 'Paddy harvesting for 6 acres',
      status: 'cancelled',
      pricing: { equipmentCost: 11000, specialistCost: 0, platformFee: 550, totalAmount: 11550 },
      acceptanceWindowHours: 6,
      acceptanceDeadline: new Date(now - 3 * 3600 * 1000), // Expired 3 hours ago
      autoCancelOnExpiry: true,
      notifiedSeekerOfExpiry: false, // Triggers auto-cancelled banner!
      cancellationReason: 'Provider acceptance timeout (auto-cancelled after 6h)',
      createdAt: new Date(now - 9 * 3600 * 1000)
    });

    // Scenario 1B: RAMESH GOWDA (9845011111) — Unaccepted pending warning
    await Booking.create({
      seeker: primarySeeker._id,
      bookingType: 'equipment_only',
      equipment: mahindraTractor._id,
      equipmentOwner: manjunathHK._id,
      startDate: new Date(now + 3 * DAY_MS),
      endDate: new Date(now + 5 * DAY_MS),
      location: { district: 'Mandya', village: 'Shivapura', state: 'Karnataka' },
      purpose: 'Land preparation for sugarcane',
      status: 'pending',
      pricing: { equipmentCost: 3600, specialistCost: 0, platformFee: 180, totalAmount: 3780 },
      acceptanceWindowHours: 12,
      acceptanceDeadline: new Date(now - 2 * 3600 * 1000), // Expired 2 hours ago
      autoCancelOnExpiry: false,
      notifiedSeekerOfExpiry: false, // Triggers unaccepted pending banner!
      createdAt: new Date(now - 14 * 3600 * 1000)
    });

    // Scenario 1C: RAMESH GOWDA (9845011111) — Active Confirmed Bundle
    await Booking.create({
      seeker: primarySeeker._id,
      bookingType: 'bundle',
      equipment: waterPump._id,
      equipmentOwner: manjunathHK._id,
      specialist: electricianSpec._id,
      specialistOwner: electricianSpec.user,
      startDate: new Date(now - 1 * DAY_MS),
      endDate: new Date(now + 1 * DAY_MS),
      location: { district: 'Mandya', village: 'Shivapura', state: 'Karnataka' },
      purpose: 'Irrigation pump motor connection & watering',
      status: 'confirmed',
      pricing: { equipmentCost: 1200, specialistCost: 1400, platformFee: 130, totalAmount: 2730, isPaid: true, paymentMethod: 'upi' },
      createdAt: new Date(now - 2 * DAY_MS)
    });

    // Scenario 2A: SURESH PATEL (9845022222) — Incoming Pending Tractor Request from Ramesh Gowda
    await Booking.create({
      seeker: primarySeeker._id,
      bookingType: 'equipment_only',
      equipment: johnDeereTractor._id,
      equipmentOwner: sureshPatel._id,
      startDate: new Date(now + 2 * DAY_MS),
      endDate: new Date(now + 4 * DAY_MS),
      location: { district: 'Belagavi', village: 'Bailhongal', state: 'Karnataka' },
      purpose: 'Deep ploughing & black cotton soil preparation for sugarcane',
      status: 'pending',
      pricing: { equipmentCost: 4800, specialistCost: 0, platformFee: 240, totalAmount: 5040 },
      acceptanceWindowHours: 12,
      acceptanceDeadline: new Date(now + 10 * 3600 * 1000), // Active 10 hours remaining!
      autoCancelOnExpiry: true,
      notifiedSeekerOfExpiry: false,
      createdAt: new Date(now - 2 * 3600 * 1000)
    });

    // Scenario 2B: SURESH PATEL (9845022222) & MANJUNATH K (9845044444) — Incoming Pending Bundle Request
    await Booking.create({
      seeker: seekers[3]._id, // Chennamma Patil
      bookingType: 'bundle',
      equipment: sonalikaRotavator._id,
      equipmentOwner: sureshPatel._id,
      specialist: manjunathKSpec._id,
      specialistOwner: manjunathK._id,
      startDate: new Date(now + 3 * DAY_MS),
      endDate: new Date(now + 5 * DAY_MS),
      location: { district: 'Belagavi', village: 'Bailhongal', state: 'Karnataka' },
      purpose: 'Rotavator tilling & skilled machine operation across 6 acres',
      status: 'pending',
      pricing: { equipmentCost: 2400, specialistCost: 1600, platformFee: 200, totalAmount: 4200 },
      acceptanceWindowHours: 24,
      acceptanceDeadline: new Date(now + 18 * 3600 * 1000), // Active 18 hours remaining!
      autoCancelOnExpiry: true,
      notifiedSeekerOfExpiry: false,
      createdAt: new Date(now - 6 * 3600 * 1000)
    });

    // Scenario 2C: SURESH PATEL (9845022222) — Confirmed Active Equipment Rental
    await Booking.create({
      seeker: seekers[1]._id, // Basavarajappa K.
      bookingType: 'equipment_only',
      equipment: sugarcaneTrailer._id,
      equipmentOwner: sureshPatel._id,
      startDate: new Date(now - 1 * DAY_MS),
      endDate: new Date(now + 2 * DAY_MS),
      location: { district: 'Belagavi', village: 'Bailhongal', state: 'Karnataka' },
      purpose: 'Sugarcane haulage to sugar mill',
      status: 'confirmed',
      pricing: { equipmentCost: 3600, specialistCost: 0, platformFee: 180, totalAmount: 3780, isPaid: true, paymentMethod: 'upi' },
      createdAt: new Date(now - 2 * DAY_MS)
    });

    // Scenario 3: DR. ANANYA RAO (9845033333) — Incoming Consultation Request
    await Booking.create({
      seeker: seekers[1]._id, // Basavarajappa K.
      bookingType: 'specialist_only',
      specialist: drAnanyaSpec._id,
      specialistOwner: drAnanya._id,
      startDate: new Date(now + 4 * DAY_MS),
      endDate: new Date(now + 5 * DAY_MS),
      location: { district: 'Dharwad', village: 'Navalgund', state: 'Karnataka' },
      purpose: 'Cotton leaf curl virus field inspection & organic nutrient advisory',
      status: 'pending',
      pricing: { equipmentCost: 0, specialistCost: 1200, platformFee: 60, totalAmount: 1260 },
      acceptanceWindowHours: 24,
      acceptanceDeadline: new Date(now + 14 * 3600 * 1000), // Active 14 hours remaining!
      autoCancelOnExpiry: true,
      notifiedSeekerOfExpiry: false,
      createdAt: new Date(now - 10 * 3600 * 1000)
    });

    // Scenario 4: MANJUNATH K (9845044444) — Standalone Operator Hire Request
    await Booking.create({
      seeker: seekers[2]._id, // Ningappa Biradar
      bookingType: 'specialist_only',
      specialist: manjunathKSpec._id,
      specialistOwner: manjunathK._id,
      startDate: new Date(now + 3 * DAY_MS),
      endDate: new Date(now + 6 * DAY_MS),
      location: { district: 'Vijayapura', village: 'Indi', state: 'Karnataka' },
      purpose: 'Skilled heavy tractor driver for 3-day orchard deep aeration',
      status: 'pending',
      pricing: { equipmentCost: 0, specialistCost: 2400, platformFee: 120, totalAmount: 2520 },
      acceptanceWindowHours: 24,
      acceptanceDeadline: new Date(now + 16 * 3600 * 1000), // Active 16 hours remaining!
      autoCancelOnExpiry: true,
      notifiedSeekerOfExpiry: false,
      createdAt: new Date(now - 8 * 3600 * 1000)
    });

    // Bookings 5 to 25: Spread across past 2 to 30 days (Completed with ratings across all categories)
    const pastBookingsList = [
      { daysAgo: 3, cat: 'tractor', spType: 'tractor_driver', days: 2, seeker: seekers[1], provider: providers[2], type: 'bundle', purpose: 'Field deep ploughing' },
      { daysAgo: 5, cat: 'harvester', spType: 'harvester_operator', days: 3, seeker: primarySeeker, provider: manjunathHK, type: 'bundle', purpose: 'Paddy combine harvesting' },
      { daysAgo: 7, cat: 'rotavator', spType: null, days: 2, seeker: seekers[1], provider: sureshPatel, type: 'equipment_only', purpose: 'Rotary tiller seedbed prep' },
      { daysAgo: 9, cat: 'drone', spType: 'agronomist', days: 1, seeker: seekers[2], provider: manjunathHK, type: 'bundle', purpose: 'Precision foliar nutrient spray' },
      { daysAgo: 11, cat: 'baler', spType: 'tractor_driver', days: 2, seeker: seekers[3], provider: sureshPatel, type: 'bundle', purpose: 'Sugarcane trash round baling' },
      { daysAgo: 13, cat: 'power_weeder', spType: null, days: 2, seeker: seekers[4], provider: providers[6], type: 'equipment_only', purpose: 'Ginger crop weed removal' },
      { daysAgo: 15, cat: 'water_pump', spType: 'pump_mechanic', days: 3, seeker: primarySeeker, provider: manjunathHK, type: 'bundle', purpose: 'Emergency drought irrigation draw' },
      { daysAgo: 17, cat: 'laser_leveler', spType: 'tractor_driver', days: 2, seeker: seekers[3], provider: providers[5], type: 'bundle', purpose: 'Laser leveling 5-acre paddy plot' },
      { daysAgo: 19, cat: 'concrete_mixer', spType: 'mason', days: 4, seeker: seekers[2], provider: providers[2], type: 'bundle', purpose: 'Farm godown concrete floor slab' },
      { daysAgo: 21, cat: 'generator', spType: 'electrician', days: 2, seeker: seekers[1], provider: providers[2], type: 'bundle', purpose: 'Temple festival power backup' },
      { daysAgo: 23, cat: 'sprayer', spType: 'agronomist', days: 2, seeker: primarySeeker, provider: manjunathHK, type: 'bundle', purpose: 'Pest spraying & crop diagnosis' },
      { daysAgo: 25, cat: 'seed_drill', spType: null, days: 2, seeker: seekers[3], provider: providers[7], type: 'equipment_only', purpose: 'Zero till gram & safflower planting' },
      { daysAgo: 27, cat: 'tiller', spType: null, days: 3, seeker: seekers[1], provider: providers[8], type: 'equipment_only', purpose: 'Wetland paddy terrace cultivation' },
      { daysAgo: 29, cat: 'chaff_cutter', spType: null, days: 2, seeker: seekers[4], provider: providers[7], type: 'equipment_only', purpose: 'Dairy farm silage chopping' },
      { daysAgo: 30, cat: 'tractor_trolley', spType: 'tractor_driver', days: 2, seeker: primarySeeker, provider: sureshPatel, type: 'bundle', purpose: 'Sugarcane haulage to sugar factory' }
    ];

    for (const pb of pastBookingsList) {
      const eq = createdEquipment.find(e => e.category === pb.cat) || createdEquipment[0];
      const sp = pb.spType ? createdSpecialists.find(s => s.specialization === pb.spType) || createdSpecialists[0] : null;
      const spUser = sp ? specUsers.find(u => u._id.toString() === sp.user.toString()) : null;
      const start = new Date(now - pb.daysAgo * DAY_MS);
      const end = new Date(start.getTime() + pb.days * DAY_MS);
      const eqCost = eq.pricePerDay * pb.days;
      const spCost = sp ? sp.pricePerDay * pb.days : 0;
      const fee = Math.round((eqCost + spCost) * 0.05);

      const bDoc = await Booking.create({
        seeker: pb.seeker._id,
        bookingType: pb.type,
        equipment: eq._id,
        equipmentOwner: pb.provider._id,
        specialist: sp ? sp._id : undefined,
        specialistOwner: spUser ? spUser._id : undefined,
        startDate: start,
        endDate: end,
        location: { district: pb.seeker.district, village: pb.seeker.village, state: 'Karnataka' },
        purpose: pb.purpose,
        status: 'completed',
        pricing: { equipmentCost: eqCost, specialistCost: spCost, platformFee: fee, totalAmount: eqCost + spCost + fee, isPaid: true, paymentMethod: 'cash' },
        createdAt: new Date(start.getTime() - 1 * DAY_MS)
      });

      // 1. Add Equipment Rating
      const eqRating = await Rating.create({
        booking: bDoc._id,
        ratedBy: pb.seeker._id,
        targetUser: pb.provider._id,
        ratedUser: pb.provider._id,
        targetEquipment: eq._id,
        equipment: eq._id,
        ratingType: 'equipment',
        score: 5,
        equipmentConditionScore: 5,
        equipmentReliabilityScore: 5,
        review: `${eq.title} worked exceptionally well and was delivered in pristine condition. Highly recommended!`,
        comment: `${eq.title} worked exceptionally well and was delivered in pristine condition. Highly recommended!`,
        createdAt: end
      });

      bDoc.ratings = {
        equipmentRating: { submitted: true, ratingId: eqRating._id }
      };

      // 2. Add Specialist Rating (if bundle / specialist booking)
      if (sp && spUser) {
        const spRating = await Rating.create({
          booking: bDoc._id,
          ratedBy: pb.seeker._id,
          targetUser: spUser._id,
          ratedUser: spUser._id,
          targetSpecialist: sp._id,
          specialist: sp._id,
          ratingType: 'specialist',
          score: 5,
          specialistSkillScore: 5,
          specialistPunctualityScore: 5,
          specialistCommunicationScore: 5,
          review: `${sp.displayTitle} performed the work with exceptional skill, punctuality, and professionalism. Very dependable!`,
          comment: `${sp.displayTitle} performed the work with exceptional skill, punctuality, and professionalism. Very dependable!`,
          createdAt: end
        });

        bDoc.ratings.specialistRating = { submitted: true, ratingId: spRating._id };
      }

      await bDoc.save();
    }

    // Sync all aggregated equipment and specialist ratings
    for (const eq of createdEquipment) {
      const eqRatings = await Rating.find({
        $or: [{ targetEquipment: eq._id }, { equipment: eq._id }],
        ratingType: 'equipment'
      });
      if (eqRatings.length > 0) {
        const avg = eqRatings.reduce((a, b) => a + b.score, 0) / eqRatings.length;
        await Equipment.findByIdAndUpdate(eq._id, {
          'rating.average': Number(avg.toFixed(1)),
          'rating.count': eqRatings.length
        });
      }
    }

    for (const sp of createdSpecialists) {
      const spRatings = await Rating.find({
        $or: [{ targetSpecialist: sp._id }, { specialist: sp._id }],
        ratingType: 'specialist'
      });
      if (spRatings.length > 0) {
        const avg = spRatings.reduce((a, b) => a + b.score, 0) / spRatings.length;
        await Specialist.findByIdAndUpdate(sp._id, {
          'rating.average': Number(avg.toFixed(1)),
          'rating.count': spRatings.length
        });
      }
    }

    // 5. Create Notice Board Requirements
    console.log('📢 Seeding Notice Board requirements and community offers...');
    for (const r of requirementsData) {
      const seeker = seekers[r.seekerIdx] || seekers[0];
      const coords = KARNATAKA_DISTRICT_COORDS[r.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      const createdAt = new Date(now - r.daysAgo * DAY_MS);

      const responses = r.responses.map(resp => {
        const respondent = resp.providerIdx != null
          ? (providers[resp.providerIdx] || providers[0])
          : (specUsers[resp.specUserIdx] || specUsers[0]);
        return {
          respondent: respondent._id,
          message: resp.message,
          offeredPrice: resp.offeredPrice,
          respondedAt: new Date(now - resp.daysAgo * DAY_MS)
        };
      });

      await Requirement.create({
        postedBy: seeker._id,
        title: r.title,
        description: r.description,
        requirementType: r.requirementType,
        equipmentNeeded: r.category ? { category: r.category } : undefined,
        district: r.district,
        village: r.village || '',
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
        isUrgent: r.isUrgent,
        status: 'open',
        responses,
        expiresAt: new Date(createdAt.getTime() + 14 * DAY_MS),
        createdAt
      });
    }

    console.log('\n======================================================');
    console.log('🎉 REALISTIC DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');
    console.log('📊 Seeded Summary:');
    console.log(`- Users: ${createdUsers.length} realistic profiles across Karnataka`);
    console.log(`- Equipment: ${createdEquipment.length} units covering all 24 categories!`);
    console.log(`- Specialists: ${createdSpecialists.length} certified operators & professionals across all tiers`);
    console.log(`- Bookings: 18 live & historical bookings across 30 days`);
    console.log(`- Active Alerts: Auto-cancelled timeout + Unaccepted pending on Ramesh Gowda's account`);
    console.log(`- Notice Board: ${requirementsData.length} active requirement posts with community responses\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedRealisticDatabase();

