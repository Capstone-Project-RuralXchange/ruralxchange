export const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
  'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
  'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
];

export const EQUIPMENT_CATEGORIES = [
  { value: 'tractor', label: 'Tractor', icon: '🚜', color: '#8B4513' },
  { value: 'harvester', label: 'Harvester', icon: '🌾', color: '#C1440E' },
  { value: 'rotavator', label: 'Rotavator', icon: '⚙️', color: '#8B4513' },
  { value: 'cultivator', label: 'Cultivator / Plough', icon: '🌱', color: '#8B4513' },
  { value: 'seed_drill', label: 'Seed Drill / Planter', icon: '🌾', color: '#2D6A2D' },
  { value: 'baler', label: 'Straw Baler', icon: '📦', color: '#C1440E' },
  { value: 'chaff_cutter', label: 'Chaff Cutter', icon: '🌿', color: '#2D6A2D' },
  { value: 'power_weeder', label: 'Power Weeder', icon: '✂️', color: '#2D6A2D' },
  { value: 'sprayer', label: 'Power Sprayer', icon: '🌿', color: '#2D6A2D' },
  { value: 'drone', label: 'Agri Drone', icon: '🚁', color: '#3B82F6' },
  { value: 'water_pump', label: 'Water Pump', icon: '💧', color: '#3B82F6' },
  { value: 'thresher', label: 'Thresher', icon: '🌽', color: '#C1440E' },
  { value: 'tiller', label: 'Power Tiller', icon: '🔧', color: '#6B7280' },
  { value: 'laser_leveler', label: 'Laser Land Leveler', icon: '📐', color: '#E8A020' },
  { value: 'earth_auger', label: 'Earth Auger', icon: '🕳️', color: '#8B4513' },
  { value: 'tractor_trolley', label: 'Tractor Trolley', icon: '🚛', color: '#8B4513' },
  { value: 'generator', label: 'Generator', icon: '⚡', color: '#E8A020' },
  { value: 'concrete_mixer', label: 'Concrete Mixer', icon: '🏗️', color: '#6B7280' },
  { value: 'tent_structure', label: 'Tent Structure', icon: '⛺', color: '#059669' },
  { value: 'sound_system', label: 'Sound System', icon: '🔊', color: '#7C3AED' },
  { value: 'lighting', label: 'Lighting', icon: '💡', color: '#E8A020' },
  { value: 'welding_machine', label: 'Welding Machine', icon: '🔩', color: '#6B7280' },
  { value: 'drill', label: 'Drill Machine', icon: '🛠️', color: '#8B4513' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
];

export const SPECIALIST_TYPES = [
  { value: 'tractor_driver', label: 'Tractor Driver', icon: '🚜', tier: 'skilled' },
  { value: 'harvester_operator', label: 'Harvester Operator', icon: '🌾', tier: 'skilled' },
  { value: 'electrician', label: 'Electrician', icon: '⚡', tier: 'skilled' },
  { value: 'mason', label: 'Mason', icon: '🧱', tier: 'skilled' },
  { value: 'plumber', label: 'Plumber', icon: '🔧', tier: 'skilled' },
  { value: 'pump_mechanic', label: 'Pump Mechanic', icon: '⚙️', tier: 'skilled' },
  { value: 'welder', label: 'Welder', icon: '🔩', tier: 'skilled' },
  { value: 'carpenter', label: 'Carpenter', icon: '🪚', tier: 'skilled' },
  { value: 'painter', label: 'Painter', icon: '🎨', tier: 'skilled' },
  { value: 'general_laborer', label: 'Field Labourer', icon: '👷', tier: 'labour' },
  { value: 'agronomist', label: 'Agronomist', icon: '🌱', tier: 'professional' },
  { value: 'civil_engineer', label: 'Civil Engineer', icon: '🏛️', tier: 'professional' },
  { value: 'electrical_engineer', label: 'Electrical Engineer', icon: '🔌', tier: 'professional' },
  { value: 'animal_health_worker', label: 'Animal Health Worker', icon: '🐄', tier: 'professional' },
  { value: 'refrigeration_technician', label: 'Refrigeration Tech', icon: '❄️', tier: 'skilled' },
  { value: 'other', label: 'Other', icon: '👤', tier: 'skilled' },
];

export const BOOKING_TYPES = [
  { value: 'equipment_only', label: 'Equipment Only', icon: '🚜' },
  { value: 'specialist_only', label: 'Specialist Only', icon: '👷' },
  { value: 'bundle', label: 'Bundle (Equipment + Specialist)', icon: '📦' },
  { value: 'professional_service', label: 'Professional Service', icon: '🏛️' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
];

export const EQUIPMENT_CONDITION = [
  { value: 'excellent', label: 'Excellent', color: '#155724' },
  { value: 'good', label: 'Good', color: '#856404' },
  { value: 'fair', label: 'Fair', color: '#721C24' },
];

export const USER_ROLES = [
  { value: 'seeker', label: 'Seeker (I need equipment/services)', icon: '🔍' },
  { value: 'provider', label: 'Provider (I have equipment to rent)', icon: '🚜' },
  { value: 'specialist', label: 'Specialist (I offer skilled services)', icon: '👷' },
];

export const getEquipmentCategory = (value) =>
  EQUIPMENT_CATEGORIES.find(c => c.value === value) || { label: value, icon: '📦', color: '#6B7280' };

export const getSpecialistType = (value) =>
  SPECIALIST_TYPES.find(s => s.value === value) || { label: value, icon: '👤', tier: 'skilled' };

export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const getDurationDays = (start, end) =>
  Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
export const BOOKING_STATUSES = ['pending','confirmed','in_progress','completed','cancelled'];
