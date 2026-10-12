const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const { createBooking, updateStatus, expirePending } = require('../services/bookings');
const { dateRange } = require('../services/bookingRules');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Booking = require('../models/Booking');
const User = require('../models/User');
let mongo, equipment, specialist, user, provider, operator;
const payload = (extras = {}) => ({ bookingType: 'equipment_only', equipmentId: String(equipment._id), startDate: '2099-10-20', endDate: '2099-10-22', location: { district: 'Mysuru' }, purpose: 'Test', ...extras });
before(async () => { mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } }); await mongoose.connect(mongo.getUri()); });
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });
beforeEach(async () => {
  await Promise.all([Booking.deleteMany({}), Equipment.deleteMany({}), Specialist.deleteMany({}), User.deleteMany({})]);
  user = { id: String(new mongoose.Types.ObjectId()), role: 'seeker' };
  provider = { id: String(new mongoose.Types.ObjectId()), role: 'provider' };
  operator = { id: String(new mongoose.Types.ObjectId()), role: 'specialist' };
  equipment = await Equipment.create({ owner: provider.id, title: 'Test', category: 'tractor', district: 'Mysuru', pricePerDay: 1000 });
  specialist = await Specialist.create({ user: operator.id, specialization: 'tractor_driver', district: 'Mysuru', pricePerDay: 800 });
});
test('inclusive pricing and invalid dates', () => {
  assert.equal(dateRange('2099-10-20','2099-10-20').days,1);
  assert.equal(dateRange('2099-10-20','2099-10-22').days,3);
  for (const [a,b] of [['junk','2099-01-01'], ['+202620-10-20','+202620-10-22'], ['2099-10-22','2099-10-20'], ['2020-01-01','2020-01-01']]) assert.throws(() => dateRange(a,b));
});
test('two equipment racers: one wins, one 409, exactly one reservation', async () => {
  const results = await Promise.allSettled([createBooking(user,payload()), createBooking({ ...user, id: String(new mongoose.Types.ObjectId()) },payload())]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.statusCode,409);
  assert.equal(await Booking.countDocuments(),1);
  assert.equal((await Equipment.findById(equipment._id)).bookedDates.length,1);
});
test('non-overlapping and multiple equipment bookings succeed', async () => {
  await createBooking(user,payload());
  await createBooking(user,payload({ startDate:'2099-10-23',endDate:'2099-10-24' }));
  const other = await Equipment.create({ owner: provider.id, title:'Other', category:'tractor',district:'Mysuru',pricePerDay:0 });
  const b = await createBooking(user,payload({ equipmentId:String(other._id),startDate:'2099-10-20',endDate:'2099-10-20' }));
  assert.equal(b.pricing.totalAmount,0); assert.equal(await Booking.countDocuments(),3);
});
test('bundle specialist race across distinct equipment rolls back loser', async () => {
  const other = await Equipment.create({ owner: provider.id, title:'Other', category:'tractor',district:'Mysuru',pricePerDay:1000 });
  const body = payload({ bookingType:'bundle',specialistId:String(specialist._id) });
  const results = await Promise.allSettled([createBooking(user,body),createBooking(user,{ ...body,equipmentId:String(other._id) })]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(await Booking.countDocuments(),1);
  const all = await Equipment.find(); assert.equal(all.reduce((s,e)=>s+e.bookedDates.length,0),1);
  assert.equal((await Specialist.findById(specialist._id)).bookedDates.length,1);
});
test('bundle compatibility, both parties must accept, cancellation releases only its range', async () => {
  await Specialist.updateOne({_id:specialist._id},{ specialization:'animal_health_worker' });
  await assert.rejects(createBooking(user,payload({ bookingType:'bundle',specialistId:String(specialist._id) })), /not compatible/);
  await Specialist.updateOne({_id:specialist._id},{ specialization:'tractor_driver' });
  let b = await createBooking(user,payload({ bookingType:'bundle',specialistId:String(specialist._id) }));
  assert.equal(b.pricing.totalAmount,5670);
  b=await updateStatus(provider,b.id,{status:'confirmed'}); assert.equal(b.status,'pending');
  b=await updateStatus(operator,b.id,{status:'confirmed'}); assert.equal(b.status,'confirmed');
  await createBooking(user,payload({startDate:'2099-10-25',endDate:'2099-10-26'}));
  await updateStatus(user,b.id,{status:'cancelled',cancellationReason:'Test cleanup'});
  assert.equal((await Equipment.findById(equipment._id)).bookedDates.length,1);
  assert.equal((await Specialist.findById(specialist._id)).bookedDates.length,0);
});
test('expiry releases stale pending locks, invalid transitions and outsiders rejected', async () => {
  const b = await createBooking(user,payload());
  await assert.rejects(updateStatus(user,b.id,{status:'confirmed'}), e=>e.statusCode===403);
  await assert.rejects(updateStatus(provider,b.id,{status:'completed'}), e=>e.statusCode===409);
  await assert.rejects(updateStatus({id:String(new mongoose.Types.ObjectId())},b.id,{status:'cancelled'}),e=>e.statusCode===403);
  await Booking.updateOne({_id:b._id},{responseDeadline:new Date(0)});await expirePending();
  assert.equal((await Booking.findById(b._id)).status,'cancelled');
  assert.equal((await Equipment.findById(equipment._id)).bookedDates.length,0);
});
test('maintenance, invalid shape, response window validation', async () => {
  await assert.rejects(createBooking(user,payload({responseWindowHours:999999})),/1-168/);
  await assert.rejects(createBooking(user,payload({bookingType:'bundle'})),/does not match/);
  await Equipment.updateOne({_id:equipment._id},{availabilityStatus:'maintenance'});
  await assert.rejects(createBooking(user,payload()),e=>e.statusCode===409);
});
test('rate buckets isolate forwarded clients; health bypasses; auth is limited', async () => {
  const app = require('../server');
  for(let i=0;i<300;i++) await request(app).get('/api/missing').set('X-Forwarded-For','198.51.100.1');
  assert.equal((await request(app).get('/api/missing').set('X-Forwarded-For','198.51.100.1')).status,429);
  assert.equal((await request(app).get('/api/missing').set('X-Forwarded-For','198.51.100.2')).status,404);
  assert.equal((await request(app).get('/api/health').set('X-Forwarded-For','198.51.100.1')).status,200);
});
test('cookie session has no token JSON, blocks CSRF, rejects admin self-registration', async () => {
  process.env.JWT_SECRET='test-only-not-for-production';
  const app = require('../server');
  const agent=request.agent(app);
  const result=await agent.post('/api/auth/register').send({name:'Test User',phone:'9876543210',password:'test-password',role:'seeker',district:'Mysuru'});
  assert.equal(result.status,201);assert.equal(result.body.token,undefined);
  assert.match(result.headers['set-cookie'][0],/HttpOnly/);
  assert.equal((await agent.get('/api/auth/me')).status,200);
  assert.equal((await agent.put('/api/auth/updateprofile').set('Origin','https://bad.example').send({name:'Bad'})).status,403);
  assert.equal((await agent.put('/api/auth/updateprofile').set('Origin','http://localhost:3000').send({name:'Good'})).status,200);
  assert.equal((await request(app).post('/api/auth/register').send({role:'admin'})).status,400);
  await agent.post('/api/auth/logout'); assert.equal((await agent.get('/api/auth/me')).status,401);
});
test('migration rebuilds reservations, clears stale booked bit, expires legacy requests', async () => {
  const {migrate}=require('../scripts/migrate-booking-availability');
  const future=await createBooking(user,payload());
  await Equipment.updateOne({_id:equipment._id},{availabilityStatus:'booked',bookedDates:[]});
  await Booking.updateOne({_id:future._id},{$unset:{responseDeadline:1,equipmentOwnerStatus:1}});
  await migrate();
  const eq=await Equipment.findById(equipment._id);
  assert.equal(eq.availabilityStatus,'available');assert.equal(eq.bookedDates.length,1);
  assert.equal((await Booking.findById(future._id)).equipmentOwnerStatus,'pending');
  await Booking.updateOne({_id:future._id},{startDate:new Date('2020-01-01'),endDate:new Date('2020-01-02')});
  await migrate();
  assert.equal((await Booking.findById(future._id)).status,'cancelled');
  assert.equal((await Equipment.findById(equipment._id)).bookedDates.length,0);
});
test('listing edit cannot overwrite owner or reservations; zero price and limits persist', async () => {
  process.env.JWT_SECRET='test-only-not-for-production';
  const owner=await User.create({name:'Owner',phone:'9876543211',password:'test-password',role:'provider',district:'Mysuru'});
  await Equipment.updateOne({_id:equipment._id},{owner:owner._id});
  const app=require('../server'),token=owner.getSignedJwtToken();
  const body=payload();await createBooking(user,body);
  const result=await request(app).put('/api/equipment/'+equipment._id).set('Authorization','Bearer '+token).send({pricePerDay:0,minRentalDays:2,maxRentalDays:8,owner:user.id,bookedDates:[],availabilityStatus:'available'});
  assert.equal(result.status,200);assert.equal(result.body.data.pricePerDay,0);
  assert.equal(result.body.data.minRentalDays,2);assert.equal(result.body.data.maxRentalDays,8);
  assert.equal(String(result.body.data.owner),String(owner._id));assert.equal(result.body.data.bookedDates.length,1);
  const invalid=await request(app).put('/api/equipment/'+equipment._id).set('Authorization','Bearer '+token).send({minRentalDays:10,maxRentalDays:1});
  assert.equal(invalid.status,400);
});
test('booking detail denies a stranger; provider dashboard counts incoming bookings', async () => {
  process.env.JWT_SECRET='test-only-not-for-production';
  const owner=await User.create({name:'Owner',phone:'9876543211',password:'test-password',role:'provider',district:'Mysuru'});
  const stranger=await User.create({name:'Stranger',phone:'9876543212',password:'test-password',role:'seeker',district:'Mysuru'});
  await Equipment.updateOne({_id:equipment._id},{owner:owner._id});
  const b=await createBooking(user,payload());const app=require('../server');
  assert.equal((await request(app).get('/api/bookings/'+b.id).set('Authorization','Bearer '+stranger.getSignedJwtToken())).status,403);
  const stats=await request(app).get('/api/users/dashboard').set('Authorization','Bearer '+owner.getSignedJwtToken());
  assert.equal(stats.body.data.stats.totalBookingsMade,1);
});
test('existing response-window API retained; no-auto-cancel requests expire when past-dated', async () => {
  const b=await createBooking(user,payload({acceptanceWindowHours:3,autoCancelOnExpiry:false}));
  assert.equal(b.acceptanceWindowHours,3);assert.equal(b.autoCancelOnExpiry,false);
  await Booking.updateOne({_id:b._id},{acceptanceDeadline:new Date(0),responseDeadline:new Date(0)});
  await expirePending();assert.equal((await Booking.findById(b._id)).status,'pending');
  await Booking.updateOne({_id:b._id},{startDate:new Date('2020-01-01')});await expirePending();
  assert.equal((await Booking.findById(b._id)).status,'cancelled');
});
