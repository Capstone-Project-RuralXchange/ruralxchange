const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const { buildDataset, checkTarget, replaceDataset, models } = require('../seed');
const { allowedTypes } = require('../services/bookingRules');
const { createBooking } = require('../services/bookings');
const crypto = require('crypto');
let mongo, data, app;
const demoPassword = crypto.randomBytes(24).toString('hex'), adminPassword = crypto.randomBytes(24).toString('hex');
before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri()); process.env.JWT_SECRET = 'isolated-seed-test';
  data = await buildDataset({ demoPassword, adminPassword });
  app = require('../server');
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });
test('seed requires explicit reset, exact DB name, remote acknowledgment and strong distinct passwords', async () => {
  assert.throws(() => checkTarget('mongodb://localhost/demo', [], { SEED_EXPECTED_DB: 'demo' }), /confirm-reset/);
  assert.throws(() => checkTarget('mongodb://localhost/demo', ['--confirm-reset'], { SEED_EXPECTED_DB: 'other' }), /exact database/);
  assert.throws(() => checkTarget('mongodb+srv://example.invalid/demo', ['--confirm-reset'], { SEED_EXPECTED_DB: 'demo' }), /Remote reset/);
  assert.equal(checkTarget('mongodb://localhost/demo', ['--confirm-reset'], { SEED_EXPECTED_DB: 'demo' }), 'demo');
  await assert.rejects(buildDataset({ demoPassword: 'short', adminPassword }), /12 characters/);
  await assert.rejects(buildDataset({ demoPassword, adminPassword: demoPassword }), /separate admin/);
});
test('catalog and all references match current app rules; ratings and pricing are exact', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(data).map(([k,v]) => [k,v.length])), { users:31,equipment:49,specialists:14,bookings:17,requirements:7,ratings:10 });
  const users = new Set(data.users.map(u => String(u._id)));
  const byId = list => new Map(list.map(item => [String(item._id),item]));
  const equipment = byId(data.equipment), specialists = byId(data.specialists), bookings = byId(data.bookings);
  assert.equal(new Set(data.equipment.map(e => e.category)).size, 24);
  for (const b of data.bookings) {
    assert(users.has(String(b.seeker)));
    const e = equipment.get(String(b.equipment)), s = specialists.get(String(b.specialist));
    if (e) assert.equal(String(b.equipmentOwner),String(e.owner)); else assert.equal(b.equipmentOwnerStatus,undefined);
    if (s) assert.equal(String(b.specialistOwner),String(s.user)); else assert.equal(b.specialistStatus,undefined);
    if (e && s) assert(allowedTypes(e).includes(s.specialization));
    const days = (b.endDate-b.startDate)/86400000+1;
    assert.equal(b.pricing.equipmentCost,(e?.pricePerDay||0)*days);
    assert.equal(b.pricing.specialistCost,(s?.pricePerDay||0)*days);
    assert.equal(b.pricing.totalAmount,b.pricing.equipmentCost+b.pricing.specialistCost+b.pricing.platformFee);
  }
  for (const resource of [...data.equipment,...data.specialists]) {
    for (const r of resource.bookedDates) assert(['pending','confirmed','in_progress'].includes(bookings.get(String(r.bookingId)).status));
    for (let i=0;i<resource.bookedDates.length;i++) for (let j=i+1;j<resource.bookedDates.length;j++) {
      const a=resource.bookedDates[i],b=resource.bookedDates[j];assert(a.end<b.start||b.end<a.start);
    }
    const scores = data.ratings.filter(r => String(r.targetEquipment||r.targetSpecialist)===String(resource._id)).map(r=>r.score);
    assert.equal(resource.rating.count,scores.length);
    assert.equal(resource.rating.average,scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0);
  }
  for (const n of data.requirements) {
    assert(users.has(String(n.postedBy)));assert.equal(new Set(n.responses.map(r=>String(r.respondent))).size,n.responses.length);
    if(n.status==='open') assert(n.expiresAt>new Date());
    for(const r of n.responses) { assert(users.has(String(r.respondent)));assert(r.message.trim());assert(Number.isFinite(r.offeredPrice)); }
  }
  for(const r of data.ratings) { const b=bookings.get(String(r.booking));assert.equal(b.status,'completed');assert.equal(String(r.ratedBy),String(b.seeker)); }
});
test('transactional reset removes old QA data, survives re-run and passwords log in through the API', async () => {
  await models.users.create({ name:'Old QA sentinel', phone:'6999999999', password:demoPassword, district:'Mysuru' });
  await replaceDataset(data); await replaceDataset(data);
  assert.equal(await models.users.countDocuments({name:'Old QA sentinel'}),0);
  assert.equal(await models.users.countDocuments({}),31);
  for(const [role,password] of [['admin',adminPassword],['seeker',demoPassword],['provider',demoPassword],['specialist',demoPassword]]) {
    const u=data.users.find(u=>u.role===role);
    const res=await request(app).post('/api/auth/login').send({phone:u.phone,password});
    assert.equal(res.status,200,role);assert.equal(res.body.user.role,role);
  }
  assert.equal((await request(app).get('/api/equipment?minPrice=&maxPrice=')).status,200);
  assert.equal((await request(app).get('/api/specialists')).status,200);
});
test('failed insertion rolls back all six collections instead of leaving an empty database', async () => {
  const broken={...data,users:[...data.users,data.users[0]]};
  await assert.rejects(replaceDataset(broken));
  for(const [key,Model] of Object.entries(models)) assert.equal(await Model.countDocuments({}),data[key].length);
});
test('seeded reservations reject overlaps, allow a free gap and use correct bundle ownership', async () => {
  const user=await models.users.findOne({role:'seeker'}),e=await models.equipment.findOne({category:'tractor'});
  const first=e.bookedDates[0],second=e.bookedDates[1];
  const body={bookingType:'equipment_only',equipmentId:String(e._id),startDate:first.start,endDate:first.end,location:{district:e.district},purpose:'Isolated seed regression'};
  await assert.rejects(createBooking(user,body),err=>err.statusCode===409);
  const start=new Date(second.end.getTime()+86400000);
  const b=await createBooking(user,{...body,startDate:start,endDate:start});
  assert.equal(b.status,'pending');assert.equal(b.specialistStatus,undefined);
  assert.equal(String(b.equipmentOwner),String(e.owner));
});
