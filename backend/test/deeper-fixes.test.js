const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../models/User'), Equipment = require('../models/Equipment'), Specialist = require('../models/Specialist');
const Rating = require('../models/Rating'), Requirement = require('../models/Requirement');
const { createBooking, updateStatus } = require('../services/bookings');
const { businessDate, dateRange } = require('../services/bookingRules');
let mongo, u, u2, p, e, other, app, token, token2;
const auth = (t) => ({ Authorization: 'Bearer ' + t });
before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  process.env.JWT_SECRET = 'isolated-test-secret';
  u = await User.create({ name: 'QA', phone: '6999999801', password: 'isolated-only-password', district: 'Mysuru' });
  u2 = await User.create({ name: 'QA2', phone: '6999999803', password: 'isolated-only-password', district: 'Mysuru' });
  p = await User.create({ name: 'Provider', phone: '6999999802', password: 'isolated-only-password', district: 'Mysuru', role: 'provider' });
  e = await Equipment.create({ owner: p.id, title: 'A', category: 'tractor', district: 'Mysuru', pricePerDay: 0 });
  other = await Equipment.create({ owner: p.id, title: 'Unrelated B', category: 'tractor', district: 'Mysuru', pricePerDay: 0 });
  await Rating.init();
  app = require('../server');
  token = u.getSignedJwtToken(); token2 = u2.getSignedJwtToken();
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });

let day = 1;
async function completed(user, equipment) {
  const d = '2099-11-' + String(day++).padStart(2, '0');
  let b = await createBooking(user, { bookingType: 'equipment_only', equipmentId: equipment.id, startDate: d, endDate: d, location: { district: 'Mysuru' }, purpose: 'Isolated test' });
  b = await updateStatus(p, b.id, { status: 'confirmed' });
  return updateStatus(p, b.id, { status: 'completed' });
}
const rate = (t, body) => request(app).post('/api/ratings').set(auth(t)).send(body);

test('finding 3: impossible and non-ISO dates are rejected', () => {
  for (const bad of ['2027-02-30', '2027-13-01', '2027-04-31', '2027-00-10', '10/20/2026', '2026-10-20 10:00', 'Oct 20 2026', '2026-1-5', '', null, undefined, 20261020, '2027-02-29', '2026-10-20T25:00:00Z']) {
    assert.throws(() => businessDate(bad), /valid dates/, String(bad));
  }
  assert.equal(businessDate('2028-02-29').toISOString(), '2028-02-29T00:00:00.000Z');
  assert.equal(businessDate('2027-02-28').toISOString(), '2027-02-28T00:00:00.000Z');
  // India-day normalization still applies to instants
  assert.equal(businessDate('2026-10-20T20:00:00Z').toISOString(), '2026-10-21T00:00:00.000Z');
  assert.equal(businessDate(new Date('2026-10-20T00:00:00Z')).toISOString(), '2026-10-20T00:00:00.000Z');
  assert.throws(() => dateRange('2099-02-30', '2099-03-01'));
});

test('finding 2: rating a different equipment than the booked one is rejected', async () => {
  const b = await completed(u, e);
  const r = await rate(token, { bookingId: b.id, ratingType: 'equipment', targetId: other.id, score: 1, review: 'x' });
  assert.equal(r.status, 403);
  assert.equal((await Equipment.findById(other.id)).rating.count, 0);
  assert.equal(await Rating.countDocuments({ booking: b.id }), 0);
});

test('finding 2: specialist rating on an equipment-only booking is rejected, valid rating works once', async () => {
  const b = await completed(u, e);
  const sp = await Specialist.create({ user: p.id, specialization: 'tractor_driver', district: 'Mysuru', pricePerDay: 1 });
  assert.equal((await rate(token, { bookingId: b.id, ratingType: 'specialist', targetId: sp.id, score: 5 })).status, 403);
  const before = (await Equipment.findById(e.id)).rating.count;
  const ok = await rate(token, { bookingId: b.id, ratingType: 'equipment', targetId: e.id, score: 4 });
  assert.equal(ok.status, 201);
  const eq = await Equipment.findById(e.id);
  assert.equal(eq.rating.count, before + 1);
  assert.equal((await rate(token, { bookingId: b.id, ratingType: 'equipment', targetId: e.id, score: 4 })).status, 409);
  assert.equal((await Equipment.findById(e.id)).rating.count, before + 1);
});

test('finding 2: other users cannot rate, bad scores and types rejected', async () => {
  const b = await completed(u, e);
  assert.equal((await rate(token2, { bookingId: b.id, ratingType: 'equipment', targetId: e.id, score: 4 })).status, 403);
  for (const score of [0, 6, 2.5, 'abc']) assert.equal((await rate(token, { bookingId: b.id, ratingType: 'equipment', targetId: e.id, score })).status, 400, String(score));
  assert.equal((await rate(token, { bookingId: b.id, ratingType: 'bogus', targetId: e.id, score: 3 })).status, 400);
  assert.equal(await Rating.countDocuments({ booking: b.id }), 0);
});

test('finding 2: concurrent duplicate ratings create exactly one rating and one increment', async () => {
  const eq2 = await Equipment.create({ owner: p.id, title: 'C', category: 'tractor', district: 'Mysuru', pricePerDay: 0 });
  const b = await completed(u, eq2);
  const body = { bookingId: b.id, ratingType: 'equipment', targetId: eq2.id, score: 3 };
  const rs = await Promise.all([rate(token, body), rate(token, body), rate(token, body)]);
  assert.deepEqual(rs.map(r => r.status).sort(), [201, 409, 409]);
  assert.equal(await Rating.countDocuments({ booking: b.id }), 1);
  const after = await Equipment.findById(eq2.id);
  assert.equal(after.rating.count, 1);
  assert.equal(after.rating.average, 3);
});

test('finding 7: specialist bio is saved and validated', async () => {
  const r = await request(app).post('/api/specialists').set(auth(token)).send({ specialization: 'tractor_driver', pricePerDay: 0, district: 'Mysuru', bio: '  Bio must survive  ' });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.bio, 'Bio must survive');
  assert.equal((await Specialist.findById(r.body.data._id)).bio, 'Bio must survive');
  const up = await request(app).put('/api/specialists/' + r.body.data._id).set(auth(token)).send({ bio: 'Updated bio' });
  assert.equal(up.status, 200);
  assert.equal(up.body.data.bio, 'Updated bio');
  const long = await request(app).put('/api/specialists/' + r.body.data._id).set(auth(token)).send({ bio: 'x'.repeat(501) });
  assert.equal(long.status, 400);
});

test('finding 9: numeric-string rental bounds compare numerically', async () => {
  const put = (b) => request(app).put('/api/equipment/' + e.id).set(auth(p.getSignedJwtToken())).send(b);
  const ok = await put({ minRentalDays: '2', maxRentalDays: '10' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.minRentalDays, 2);
  assert.equal(ok.body.data.maxRentalDays, 10);
  assert.equal((await put({ minRentalDays: '10', maxRentalDays: '2' })).status, 400);
  for (const v of ['1.5', 1.5, 'NaN', 'Infinity', '', 'abc', 0, '-1']) assert.equal((await put({ minRentalDays: v })).status, 400, 'min ' + v);
  assert.equal((await put({ maxRentalDays: '1.5' })).status, 400);
  // one-sided edit is compared against the stored value (min is 2 now)
  assert.equal((await put({ maxRentalDays: '1' })).status, 400);
  assert.equal((await put({ maxRentalDays: '3' })).status, 200);
});

async function expiredReq(extra = {}) {
  return Requirement.create({ postedBy: p.id, title: 'T', description: 'Isolated notice', requirementType: 'equipment', district: 'Mysuru', ...extra });
}
const respond = (id, t, body) => request(app).post('/api/requirements/' + id + '/respond').set(auth(t)).send(body);

test('finding 4: cancelled, expired, filled and own posts reject responses', async () => {
  const future = new Date(Date.now() + 86400000);
  for (const extra of [{ status: 'cancelled', expiresAt: new Date(0) }, { status: 'open', expiresAt: new Date(Date.now() - 1000) }, { status: 'cancelled', expiresAt: future }, { status: 'filled', expiresAt: future }, { status: 'expired', expiresAt: future }]) {
    const r = await expiredReq(extra);
    const res = await respond(r.id, token, { message: 'nope', offeredPrice: 0 });
    assert.equal(res.status, 409, JSON.stringify(extra));
    assert.equal((await Requirement.findById(r.id)).responses.length, 0);
  }
  const own = await expiredReq({ status: 'open', expiresAt: future });
  assert.equal((await respond(own.id, p.getSignedJwtToken(), { message: 'mine' })).status, 403);
  assert.equal((await respond(new mongoose.Types.ObjectId().toString(), token, { message: 'x' })).status, 404);
});

test('finding 4: open post accepts responses; zero price kept; negative/NaN rejected', async () => {
  const r = await expiredReq({ status: 'open', expiresAt: new Date(Date.now() + 86400000) });
  const zero = await respond(r.id, token, { message: 'free', offeredPrice: 0 });
  assert.equal(zero.status, 200);
  assert.equal(zero.body.data.responses[0].offeredPrice, 0);
  const none = await respond(r.id, token2, { message: 'no price' });
  assert.equal(none.status, 200);
  assert.equal(none.body.data.responses[1].offeredPrice, undefined);
  for (const bad of [-5, 'abc', 'Infinity', true]) assert.equal((await respond(r.id, token2, { message: 'm', offeredPrice: bad })).status, 400, String(bad));
  assert.equal((await Requirement.findById(r.id)).responses.length, 2);
});

test('finding 4: expired notices are excluded from the open listing', async () => {
  const live = await expiredReq({ title: 'LIVE-ONE', status: 'open', expiresAt: new Date(Date.now() + 86400000) });
  const dead = await expiredReq({ title: 'DEAD-ONE', status: 'open', expiresAt: new Date(Date.now() - 1000) });
  const res = await request(app).get('/api/requirements?limit=100');
  const titles = res.body.data.map(x => x.title);
  assert.ok(titles.includes('LIVE-ONE'));
  assert.ok(!titles.includes('DEAD-ONE'));
  assert.ok(live && dead);
});
