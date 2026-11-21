/** Explicit, transactional sample-data reset. Never runs from server startup. */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { KARNATAKA_DISTRICT_COORDS } = require('./utils/geocode');
const { businessDate, allowedTypes } = require('./services/bookingRules');
const models = {
  users: require('./models/User'), equipment: require('./models/Equipment'),
  specialists: require('./models/Specialist'), bookings: require('./models/Booking'),
  requirements: require('./models/Requirement'), ratings: require('./models/Rating')
};
const catalog = require('./seed/catalog.json');
const DAY = 86400000;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const coordinates = district => {
  const c = KARNATAKA_DISTRICT_COORDS[district];
  assert(c, 'Unknown seed district: ' + district);
  return { type: 'Point', coordinates: [c.lng, c.lat] };
};
async function buildDataset({ now = new Date(), demoPassword, adminPassword } = {}) {
  assert(typeof demoPassword === 'string' && demoPassword.length >= 12, 'SEED_DEMO_PASSWORD must contain at least 12 characters');
  assert(typeof adminPassword === 'string' && adminPassword.length >= 12, 'SEED_ADMIN_PASSWORD must contain at least 12 characters');
  assert(demoPassword !== adminPassword, 'Use a separate admin password');
  const hashes = await Promise.all([bcrypt.hash(demoPassword, 10), bcrypt.hash(adminPassword, 10)]);
  const data = Object.fromEntries(Object.keys(models).map(key => [key, []]));
  const today = businessDate(now);
  const day = offset => new Date(today.getTime() + offset * DAY);
  data.users = catalog.usersData.map(u => new models.users({ ...u, _id: new mongoose.Types.ObjectId(),
    password: hashes[u.role === 'admin' ? 1 : 0], location: coordinates(u.district),
    // All seed personas are fictional and must not be contacted.
    name: u.name, isActive: true, createdAt: day(-35), updatedAt: now }));
  const seekers = data.users.filter(u => u.role === 'seeker');
  const providers = data.users.filter(u => u.role === 'provider');
  const specialistUsers = data.users.filter(u => u.role === 'specialist');
  data.equipment = catalog.equipmentData.map(({ providerIdx, lat, lng, ...e }) => {
    assert(providers[providerIdx], 'Invalid equipment provider index');
    return new models.equipment({ ...e, owner: providers[providerIdx]._id, location: coordinates(e.district),
      minRentalDays: 1, maxRentalDays: 30, availabilityStatus: 'available', bookedDates: [],
      rating: { average: 0, count: 0 }, totalEarnings: 0, createdAt: day(-30), updatedAt: now });
  });
  data.specialists = catalog.specialistProfilesData.map(({ specUserIdx, ...s }) => {
    const user = specialistUsers[specUserIdx]; assert(user, 'Invalid specialist user index');
    return new models.specialists({ ...s, user: user._id, district: user.district, village: user.village,
      location: coordinates(user.district), bio: s.bio || 'Fictional demo profile for rural service booking.',
      availabilityStatus: 'available', bookedDates: [], rating: { average: 0, count: 0 },
      totalEarnings: 0, completedJobs: 0, isVerified: true, createdAt: day(-30), updatedAt: now });
  });
  const eq = category => data.equipment.find(e => e.category === category);
  const sp = specialization => data.specialists.find(s => s.specialization === specialization);
  const makeBooking = ({ category, skill, type, status, offset, days = 2, seeker = 0, purpose, expired = false }) => {
    const e = category ? eq(category) : null, s = skill ? sp(skill) : null;
    if (e && s) assert(allowedTypes(e).includes(s.specialization), 'Incompatible seed bundle');
    const equipmentCost = (e?.pricePerDay || 0) * days, specialistCost = (s?.pricePerDay || 0) * days;
    const platformFee = Math.round((equipmentCost + specialistCost) * .05);
    const b = new models.bookings({ seeker: seekers[seeker]._id, bookingType: type,
      equipment: e?._id, equipmentOwner: e?.owner, specialist: s?._id, specialistOwner: s?.user,
      startDate: day(offset), endDate: day(offset + days - 1), status,
      equipmentOwnerStatus: e ? status === 'in_progress' ? 'confirmed' : status : undefined,
      specialistStatus: s ? status === 'in_progress' ? 'confirmed' : status : undefined,
      location: { district: e?.district || s.district, village: e?.village || s.village, state: 'Karnataka' },
      purpose, responseWindowHours: 24, acceptanceWindowHours: 24,
      responseDeadline: new Date(now.getTime() + (expired ? -2 : 24) * 3600000),
      acceptanceDeadline: new Date(now.getTime() + (expired ? -2 : 24) * 3600000),
      autoCancelOnExpiry: true, cancellationReason: status === 'cancelled' ? expired ? 'Request expired before provider acceptance (auto-cancelled)' : 'Demo seeker cancelled after change of plans' : undefined,
      cancelledBy: status === 'cancelled' && !expired ? seekers[seeker]._id : undefined,
      pricing: { equipmentCost, specialistCost, platformFee, totalAmount: equipmentCost + specialistCost + platformFee,
        paymentMethod: 'cash', isPaid: status === 'completed' },
      createdAt: new Date(Math.min(day(offset - 2).getTime(), now.getTime() - 3600000)), updatedAt: now });
    data.bookings.push(b);
    if (['pending', 'confirmed', 'in_progress'].includes(status)) for (const resource of [e, s].filter(Boolean)) {
      assert(!resource.bookedDates.some(r => r.start <= b.endDate && r.end >= b.startDate), 'Overlapping seed reservations');
      resource.bookedDates.push({ start: b.startDate, end: b.endDate, bookingId: b._id });
    }
    if (status === 'completed') {
      if (e) e.totalEarnings += equipmentCost;
      if (s) { s.totalEarnings += specialistCost; s.completedJobs += 1; }
    }
    return b;
  };
  // Adjacent reservations and a free gap demonstrate inclusive day availability.
  makeBooking({ category: 'tractor', type: 'equipment_only', status: 'confirmed', offset: 2, purpose: 'Demo sugarcane field preparation' });
  makeBooking({ category: 'tractor', type: 'equipment_only', status: 'confirmed', offset: 4, seeker: 1, purpose: 'Demo adjacent non-overlapping rental' });
  makeBooking({ category: 'tractor', type: 'equipment_only', status: 'pending', offset: 9, purpose: 'Demo paddy land preparation awaiting acceptance' });
  makeBooking({ category: 'harvester', skill: 'harvester_operator', type: 'bundle', status: 'confirmed', offset: 7, purpose: 'Demo paddy harvesting with an operator' });
  makeBooking({ skill: 'tractor_driver', type: 'specialist_only', status: 'pending', offset: 6, purpose: 'Demo hire an operator for an owned tractor' });
  makeBooking({ skill: 'agronomist', type: 'professional_service', status: 'confirmed', offset: 3, purpose: 'Demo soil and crop advisory visit', days: 1 });
  makeBooking({ category: 'water_pump', type: 'equipment_only', status: 'in_progress', offset: 0, purpose: 'Demo canal irrigation work' });
  makeBooking({ category: 'rotavator', type: 'equipment_only', status: 'cancelled', offset: 5, purpose: 'Demo cancelled field preparation' });
  makeBooking({ category: 'generator', type: 'equipment_only', status: 'cancelled', offset: -2, purpose: 'Demo expired response-window alert', expired: true });
  const historical = [
    ['tractor', 'tractor_driver', 'bundle', -5, 4], ['harvester', 'harvester_operator', 'bundle', -9, 5],
    ['rotavator', null, 'equipment_only', -13, 3], ['water_pump', 'pump_mechanic', 'bundle', -17, 4],
    [null, 'agronomist', 'professional_service', -21, 5], ['tractor', null, 'equipment_only', -25, 5],
    ['tractor', null, 'equipment_only', -29, 4]
  ];
  historical.forEach(([category, skill, type, offset, score], index) => {
    const b = makeBooking({ category, skill, type, status: 'completed', offset, seeker: index % seekers.length,
      purpose: category ? 'Demo completed farm equipment work' : 'Demo completed crop advisory visit' });
    b.ratings = {};
    for (const [ratingType, targetId, targetUser] of [['equipment', b.equipment, b.equipmentOwner], ['specialist', b.specialist, b.specialistOwner]]) {
      if (!targetId) continue;
      const review = score === 3 ? 'Demo review: useful equipment; delivery needed better coordination.' : score === 4 ? 'Demo review: reliable service and clear instructions.' : 'Demo review: arrived on time and the work went well.';
      const r = new models.ratings({ booking: b._id, ratedBy: b.seeker, ratingType, targetUser, ratedUser: targetUser,
        targetEquipment: ratingType === 'equipment' ? targetId : undefined, equipment: ratingType === 'equipment' ? targetId : undefined,
        targetSpecialist: ratingType === 'specialist' ? targetId : undefined, specialist: ratingType === 'specialist' ? targetId : undefined,
        score, review, comment: review, createdAt: b.endDate, updatedAt: b.endDate });
      data.ratings.push(r); b.ratings[ratingType + 'Rating'] = { submitted: true, ratingId: r._id };
    }
  });
  // One completed unrated booking keeps the review form demonstrable.
  makeBooking({ category: 'seed_drill', type: 'equipment_only', status: 'completed', offset: -3, purpose: 'Demo completed sowing, ready for a review' });
  for (const [key, type, field] of [['equipment', 'equipment', 'targetEquipment'], ['specialists', 'specialist', 'targetSpecialist']]) for (const item of data[key]) {
    const scores = data.ratings.filter(r => r.ratingType === type && String(r[field]) === String(item._id)).map(r => r.score);
    item.rating = { average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0, count: scores.length };
  }
  // Demonstrate maintenance/unavailable without permanently marking reserved listings booked.
  data.equipment[data.equipment.length - 1].availabilityStatus = 'maintenance';
  data.specialists[data.specialists.length - 1].availabilityStatus = 'unavailable';
  const statuses = ['open', 'open', 'open', 'filled', 'expired', 'cancelled', 'expired'];
  data.requirements = catalog.requirementsData.map((r, index) => {
    const status = statuses[index];
    return new models.requirements({ postedBy: seekers[r.seekerIdx]._id, title: r.title,
      description: 'Fictional demo request. ' + r.description, requirementType: r.requirementType,
      equipmentNeeded: r.requirementType === 'specialist' ? undefined : { category: r.category, quantity: 1 },
      specialistNeeded: r.requirementType === 'specialist' ? { specialization: r.category, qualificationLevel: 'any' } : undefined,
      district: r.district, village: r.village, location: coordinates(r.district), isUrgent: r.isUrgent,
      status, startDate: day(status === 'expired' ? -4 : 5), endDate: day(status === 'expired' ? -2 : 7),
      duration: { value: 3, unit: 'days' }, budget: { min: 1000, max: 12000, currency: 'INR' },
      responses: r.responses.map(resp => ({ respondent: resp.providerIdx != null ? providers[resp.providerIdx]._id : specialistUsers[resp.specUserIdx]._id,
        message: resp.message, offeredPrice: resp.offeredPrice, respondedAt: day(-1) })),
      expiresAt: day(status === 'expired' ? -1 : 10), createdAt: day(status === 'expired' ? -15 : -2), updatedAt: now });
  });
  await Promise.all(Object.values(data).flat().map(doc => doc.validate()));
  return data;
}
function checkTarget(uri, args, env) {
  assert(uri, 'MONGODB_URI is required');
  assert(args.includes('--confirm-reset'), 'Reset refused: add --confirm-reset only after approving the wipe');
  let url; try { url = new URL(uri); } catch { throw new Error('Invalid MongoDB connection URI'); }
  assert(['mongodb:', 'mongodb+srv:'].includes(url.protocol), 'Invalid MongoDB protocol');
  const dbName = decodeURIComponent(url.pathname.slice(1));
  assert(dbName && env.SEED_EXPECTED_DB === dbName, 'Set SEED_EXPECTED_DB to the exact database name in MONGODB_URI');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  assert(local || env.SEED_ALLOW_REMOTE === 'I_UNDERSTAND_DATA_WILL_BE_DELETED', 'Remote reset refused: explicit SEED_ALLOW_REMOTE acknowledgment required');
  return dbName;
}
async function replaceDataset(data) {
  assert(mongoose.connection.readyState === 1, 'Database must already be connected');
  await Promise.all(Object.values(models).map(Model => Model.init()));
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const [key, Model] of Object.entries(models)) {
        await Model.deleteMany({}, { session });
        // insertMany retains precomputed hashes, unlike the User save password hook.
        await Model.insertMany(data[key].map(doc => doc.toObject()), { session });
      }
      for (const [key, Model] of Object.entries(models)) assert(await Model.countDocuments({}).session(session) === data[key].length, 'Seed count check failed: ' + key);
    });
  } finally { await session.endSession(); }
  return Object.fromEntries(Object.entries(data).map(([key, docs]) => [key, docs.length]));
}
async function main() {
  const args = process.argv.slice(2), dryRun = args.includes('--dry-run');
  const dbName = dryRun ? null : checkTarget(process.env.MONGODB_URI, args, process.env);
  const data = await buildDataset({ demoPassword: process.env.SEED_DEMO_PASSWORD || (dryRun ? crypto.randomBytes(24).toString('hex') : undefined),
    adminPassword: process.env.SEED_ADMIN_PASSWORD || (dryRun ? crypto.randomBytes(24).toString('hex') : undefined) });
  if (dryRun) { console.log('Validated sample dataset; no database connection or changes:', JSON.stringify(Object.fromEntries(Object.entries(data).map(([k,v]) => [k,v.length])))); return; }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    assert(mongoose.connection.name === dbName, 'Connected database name mismatch');
    console.log('Replacing the six application collections in database:', dbName);
    console.log('Sample reset committed:', JSON.stringify(await replaceDataset(data)));
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) main().catch(() => { console.error('Seed failed. Check reset acknowledgments, password settings, schema validation and MongoDB replica-set access. No credentials are logged.'); process.exitCode = 1; });
module.exports = { buildDataset, checkTarget, replaceDataset, models };
