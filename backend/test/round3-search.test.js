// Round 3 QA (2026-10-13): specialist tier filter, keyword search 500s,
// unescaped regex in equipment search, specifications.brand/model search.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
let mongo, app;
const oid = () => new mongoose.Types.ObjectId();

before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  app = require('../server');
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Specialist.init(); // ensure 2dsphere index exists before geo queries
  await Promise.all([Equipment.deleteMany({}), Specialist.deleteMany({})]);
  await Specialist.create([
    { user: oid(), specialization: 'agronomist', district: 'Mysuru', pricePerDay: 2000, location: { type: 'Point', coordinates: [76.65, 12.30] }, qualifications: [{ degree: 'BSc Agriculture', institution: 'UAS Bengaluru' }] },
    { user: oid(), specialization: 'civil_engineer', district: 'Mysuru', pricePerDay: 2500, location: { type: 'Point', coordinates: [76.65, 12.30] } },
    { user: oid(), specialization: 'tractor_driver', district: 'Mysuru', pricePerDay: 800, location: { type: 'Point', coordinates: [76.65, 12.30] }, bio: 'Experienced rotavator operator' },
    { user: oid(), specialization: 'pump_mechanic', district: 'Mysuru', pricePerDay: 700, location: { type: 'Point', coordinates: [76.65, 12.30] } },
    { user: oid(), specialization: 'general_laborer', district: 'Mysuru', pricePerDay: 500, location: { type: 'Point', coordinates: [76.65, 12.30] } }
  ]);
  await Equipment.create([
    { owner: oid(), title: 'Sonalika Rotavator', category: 'rotavator', district: 'Mysuru', pricePerDay: 1500, specifications: { brand: 'Sonalika', model: 'Rotamax 6ft' } },
    { owner: oid(), title: 'Kirloskar Pump', category: 'water_pump', district: 'Mysuru', pricePerDay: 400, specifications: { brand: 'Kirloskar', model: 'DM-10' } }
  ]);
});

test('round3-1: tier filter returns only matching specializations', async () => {
  const prof = await request(app).get('/api/specialists?tier=professional');
  assert.equal(prof.status, 200);
  assert.equal(prof.body.total, 2);
  assert.ok(prof.body.data.every(s => ['agronomist', 'civil_engineer'].includes(s.specialization)));

  const labour = await request(app).get('/api/specialists?tier=labour');
  assert.equal(labour.status, 200);
  assert.equal(labour.body.total, 1);
  assert.equal(labour.body.data[0].specialization, 'general_laborer');

  const skilled = await request(app).get('/api/specialists?tier=skilled');
  assert.equal(skilled.status, 200);
  assert.equal(skilled.body.total, 2);
  assert.ok(skilled.body.data.every(s => ['tractor_driver', 'pump_mechanic'].includes(s.specialization)));
});

test('round3-1b: tier filter also applies on the geo-sorted path', async () => {
  const res = await request(app).get('/api/specialists?tier=professional&lat=12.3&lng=76.6');
  assert.equal(res.status, 200);
  assert.equal(res.body.total, 2);
  assert.ok(res.body.data.every(s => ['agronomist', 'civil_engineer'].includes(s.specialization)));
});

test('round3-2: specialist keyword search works and does not 500', async () => {
  const bySpec = await request(app).get('/api/specialists?search=agronomist');
  assert.equal(bySpec.status, 200);
  assert.equal(bySpec.body.total, 1);

  const byDegree = await request(app).get('/api/specialists?search=Agriculture');
  assert.equal(byDegree.status, 200);
  assert.equal(byDegree.body.total, 1);
  assert.equal(byDegree.body.data[0].specialization, 'agronomist');

  const byBio = await request(app).get('/api/specialists?search=rotavator');
  assert.equal(byBio.status, 200);
  assert.equal(byBio.body.total, 1);
  assert.equal(byBio.body.data[0].specialization, 'tractor_driver');
});

test('round3-2b: regex metacharacters in specialist search are literal', async () => {
  for (const term of ['[', '.*', '(', '$^']) {
    const res = await request(app).get('/api/specialists?search=' + encodeURIComponent(term));
    assert.equal(res.status, 200, term);
    assert.equal(res.body.total, 0, term);
  }
});

test('round3-3: punctuation in equipment search returns 200, not 500', async () => {
  for (const term of ['[', '.*', '(', '$^']) {
    const res = await request(app).get('/api/equipment?search=' + encodeURIComponent(term));
    assert.equal(res.status, 200, term);
    assert.equal(res.body.total, 0, term);
  }
});

test('round3-4: equipment search matches specifications.brand and specifications.model', async () => {
  const byModel = await request(app).get('/api/equipment?search=' + encodeURIComponent('Rotamax 6ft'));
  assert.equal(byModel.status, 200);
  assert.equal(byModel.body.total, 1);
  assert.equal(byModel.body.data[0].title, 'Sonalika Rotavator');

  const byModel2 = await request(app).get('/api/equipment?search=DM-10');
  assert.equal(byModel2.status, 200);
  assert.equal(byModel2.body.total, 1);
  assert.equal(byModel2.body.data[0].title, 'Kirloskar Pump');

  const byBrand = await request(app).get('/api/equipment?search=Kirloskar');
  assert.equal(byBrand.status, 200);
  assert.equal(byBrand.body.total, 1);
});
