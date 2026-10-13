const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../models/User'), Equipment = require('../models/Equipment'), Requirement = require('../models/Requirement'), Rating = require('../models/Rating');
const { createBooking, updateStatus } = require('../services/bookings');
let mongo, app, seeker, provider, admin, equipment;
const headers = user => ({ Authorization: 'Bearer ' + user.getSignedJwtToken() });
before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri()); process.env.JWT_SECRET = 'isolated-test-secret';
  app = require('../server');
  [seeker, provider, admin] = await Promise.all(['seeker','provider','admin'].map((role, i) => User.create({ name: 'QA ' + role, phone: '688888880' + i, password: 'isolated-only-password', district: 'Mysuru', role })));
  equipment = await Equipment.create({ owner: provider.id, title: 'QA isolated', category: 'tractor', district: 'Mysuru', pricePerDay: 0 });
  await Rating.init();
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });
test('auth rejects objects and arrays before querying; trims phone; reports field validation; JSON parsing is generic', async () => {
  for (const value of [{ $ne: '' }, ['6888888800'], 6888888800]) {
    assert.equal((await request(app).post('/api/auth/login').send({ phone: value, password: 'test' })).status, 400);
    assert.equal((await request(app).post('/api/auth/register').send({ phone: value, password: 'test' })).status, 400);
  }
  assert.equal((await request(app).post('/api/auth/login').send({ phone: seeker.phone, password: {} })).status, 400);
  const r = await request(app).post('/api/auth/register').send({ name: 'QA trim', phone: ' 6888888810 ', password: 'isolated-only-password', district: 'Mysuru' });
  assert.equal(r.status, 201); assert.equal(r.body.user.phone, '6888888810');
  const invalid = await request(app).post('/api/auth/register').send({ name: 'QA short', phone: '6888888811', password: 'a', district: 'Mysuru' });
  assert.equal(invalid.status, 400); assert.match(invalid.body.message, /Password/);
  const badJson = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{ invalid');
  assert.equal(badJson.status, 400); assert.equal(badJson.body.message, 'Invalid JSON body');
});
test('invalid identifiers and query values return 400; limit is capped on standard and geo paths', async () => {
  for (const path of ['/equipment/abc','/specialists/abc','/users/abc','/ratings/equipment/abc','/ratings/specialist/abc']) assert.equal((await request(app).get('/api' + path)).status, 400, path);
  assert.equal((await request(app).delete('/api/requirements/abc').set(headers(seeker))).status, 400);
  for (const route of ['equipment', 'specialists', 'requirements']) {
    for (const query of ['page=0','page=-1','limit=0','page=1.5','page=1000001','limit=Infinity','search=%00','search[$ne]=x','lat=abc','lng=200']) assert.equal((await request(app).get('/api/' + route + '?' + query)).status, 400, route + query);
  }
  for (const q of ['minPrice=abc','minPrice=-1']) assert.equal((await request(app).get('/api/equipment?' + q)).status, 400);
  await Equipment.insertMany(Array.from({length:105}, (_, i) => ({ owner:provider.id, title:'Cap '+i, category:'tractor', district:'Mysuru', pricePerDay:0, location:{type:'Point',coordinates:[76.64,12.29]} })));
  for (const query of ['limit=100000','limit=100000&lat=12.29&lng=76.64']) {
    const r = await request(app).get('/api/equipment?' + query); assert.equal(r.status,200); assert.equal(r.body.data.length,100);
  }
});
test('notice creation whitelists server fields and validates district', async () => {
  const payload = { title:'QA notice', requirementType:'equipment', district:'Mysuru', status:'filled', postedBy:provider.id, responses:[{respondent:admin.id,message:'forged'}], views:1000, expiresAt:'2099-01-01' };
  const r = await request(app).post('/api/requirements').set(headers(seeker)).send(payload);
  assert.equal(r.status,201); assert.equal(r.body.data.status,'open'); assert.equal(r.body.data.responses.length,0); assert.equal(r.body.data.postedBy,seeker.id); assert.equal(r.body.data.views,0);
  assert.ok(new Date(r.body.data.expiresAt) < new Date(Date.now()+15*86400000));
  assert.equal((await request(app).post('/api/requirements').set(headers(seeker)).send({...payload,district:'Narnia'})).status,400);
});
test('one notice response per user is atomic; message and price bounded', async () => {
  const r = await Requirement.create({postedBy:provider.id,title:'QA responses',requirementType:'equipment',district:'Mysuru'});
  const respond = body => request(app).post('/api/requirements/'+r.id+'/respond').set(headers(seeker)).send(body);
  for (const body of [{message:''},{message:'   '},{message:'x'.repeat(2001)},{message:{}},{message:'OK',offeredPrice:1e30},{message:'OK',offeredPrice:{}},{message:'OK',offeredPrice:true}]) assert.equal((await respond(body)).status,400);
  const responses = await Promise.all([respond({message:'  valid  ',offeredPrice:0}), respond({message:'another'})]);
  assert.deepEqual(responses.map(x=>x.status).sort(),[200,409]); assert.equal((await Requirement.findById(r.id)).responses.length,1);
});
test('specialist onboarding preserves provider and admin roles; seeker upgrade remains', async () => {
  for (const user of [seeker,provider,admin]) {
    const r = await request(app).post('/api/specialists').set(headers(user)).send({ specialization:'tractor_driver',district:'Mysuru',pricePerDay:0 });
    assert.equal(r.status,201); assert.equal((await User.findById(user.id)).role,user.role==='seeker'?'specialist':user.role);
  }
  const r = await request(app).post('/api/equipment').set(headers(provider)).send({title:'Provider still works',category:'tractor',district:'Mysuru',pricePerDay:0}); assert.equal(r.status,201);
});
test('profile avatar permits HTTP(S) only including nested path updates', async () => {
  for (const url of ['javascript:alert(1)','data:image/svg+xml,test','ftp://example.com/a','https://']) {
    const r = await request(app).put('/api/auth/updateprofile').set(headers(seeker)).send({avatar:{url}}); assert.equal(r.status,400,url);
  }
  const r = await request(app).put('/api/auth/updateprofile').set(headers(seeker)).send({avatar:{url:'https://example.com/avatar.png'}}); assert.equal(r.status,200);
});
test('equipment-only participant state; bookings made vs received; non-overlapping reservations', async () => {
  let b = await createBooking(seeker,{bookingType:'equipment_only',equipmentId:equipment.id,startDate:'2099-08-13',endDate:'2099-08-14',purpose:'QA isolated',location:{district:'Mysuru'}});
  assert.equal(b.specialistStatus,undefined); assert.equal(b.equipmentOwnerStatus,'pending');
  const next = await createBooking(admin,{bookingType:'equipment_only',equipmentId:equipment.id,startDate:'2099-08-15',endDate:'2099-08-16',purpose:'QA isolated',location:{district:'Mysuru'}});
  const d = await request(app).get('/api/users/dashboard').set(headers(provider)); assert.equal(d.body.data.stats.totalBookingsMade,0);assert.equal(d.body.data.stats.totalBookingsReceived,2);
  b = await updateStatus(provider,b.id,{status:'confirmed'}); b = await updateStatus(provider,b.id,{status:'completed'});assert.equal(b.specialistStatus,undefined);
  await updateStatus(admin,next.id,{status:'cancelled'});
});
test('rating mean retains precision across repeated updates; display can round independently', async () => {
  const e = await Equipment.create({owner:provider.id,title:'QA averages',category:'tractor',district:'Mysuru',pricePerDay:0});
  const scores=[1,2,2,5,3,4,1];
  for(let i=0;i<scores.length;i++){
    let b=await createBooking(seeker,{bookingType:'equipment_only',equipmentId:e.id,startDate:'2099-09-'+String(i+1).padStart(2,'0'),endDate:'2099-09-'+String(i+1).padStart(2,'0'),purpose:'QA isolated',location:{district:'Mysuru'}});
    await updateStatus(provider,b.id,{status:'confirmed'}); await updateStatus(provider,b.id,{status:'completed'});
    const r=await request(app).post('/api/ratings').set(headers(seeker)).send({bookingId:b.id,ratingType:'equipment',targetId:e.id,score:scores[i]}); assert.equal(r.status,201);
  }
  const updated=await Equipment.findById(e.id);assert.ok(Math.abs(updated.rating.average-scores.reduce((a,b)=>a+b)/scores.length)<1e-12);assert.equal(updated.rating.count,scores.length);
});
