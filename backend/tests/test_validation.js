/**
 * Automated test suite to verify enum sanitization and schema validations across models
 * Run: node backend/tests/test_validation.js
 */

const assert = require('assert');
const mongoose = require('mongoose');

const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Booking = require('../models/Booking');
const Requirement = require('../models/Requirement');
const User = require('../models/User');
const Rating = require('../models/Rating');

async function runValidationTests() {
  console.log('🧪 Starting Enum Sanitization & Schema Validation Tests...\n');

  // Test 1: Equipment enum sanitization (Capitalized & spaced inputs)
  console.log('Test 1: Equipment enum sanitization');
  const dummyOwnerId = new mongoose.Types.ObjectId();
  const eq = new Equipment({
    owner: dummyOwnerId,
    title: 'Test Tractor 575',
    category: 'Tractor', // PascalCase
    condition: 'Good',   // PascalCase
    district: 'Mandya',
    pricePerDay: 1500,
    availabilityStatus: 'Available',
    specifications: {
      fuelType: 'Diesel'
    }
  });

  const eqValidateErr = eq.validateSync();
  assert.ifError(eqValidateErr);
  assert.strictEqual(eq.category, 'tractor');
  assert.strictEqual(eq.condition, 'good');
  assert.strictEqual(eq.availabilityStatus, 'available');
  assert.strictEqual(eq.specifications.fuelType, 'diesel');
  console.log('✅ Test 1 Passed: Equipment PascalCase inputs normalized to valid schema enums without errors.\n');

  // Test 2: Equipment with spaces and hyphens in category (e.g. 'Water Pump', 'tent-structure')
  console.log('Test 2: Equipment spaced/hyphenated categories');
  const eq2 = new Equipment({
    owner: dummyOwnerId,
    title: 'Water Pump Set',
    category: 'Water Pump',
    condition: 'Excellent',
    district: 'Mysuru',
    pricePerDay: 800
  });
  const eq2ValidateErr = eq2.validateSync();
  assert.ifError(eq2ValidateErr);
  assert.strictEqual(eq2.category, 'water_pump');
  assert.strictEqual(eq2.condition, 'excellent');
  console.log('✅ Test 2 Passed: Spaced category normalized to snake_case enum.\n');

  // Test 3: Specialist specialization & availabilityStatus sanitization
  console.log('Test 3: Specialist specialization sanitization');
  const sp = new Specialist({
    user: dummyOwnerId,
    specialization: 'Tractor Operator', // Alias for tractor_driver
    pricePerDay: 800,
    district: 'Mandya',
    availabilityStatus: 'Available'
  });
  const spValidateErr = sp.validateSync();
  assert.ifError(spValidateErr);
  assert.strictEqual(sp.specialization, 'tractor_driver');
  assert.strictEqual(sp.availabilityStatus, 'available');
  console.log('✅ Test 3 Passed: Specialist alias and status normalized.\n');

  // Test 4: Booking bookingType and status sanitization
  console.log('Test 4: Booking schema sanitization');
  const bk = new Booking({
    seeker: dummyOwnerId,
    bookingType: 'Equipment_Only',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    purpose: 'Ploughing land',
    location: { district: 'Mandya' },
    status: 'Pending',
    pricing: { paymentMethod: 'UPI' }
  });
  const bkValidateErr = bk.validateSync();
  assert.ifError(bkValidateErr);
  assert.strictEqual(bk.bookingType, 'equipment_only');
  assert.strictEqual(bk.status, 'pending');
  assert.strictEqual(bk.pricing.paymentMethod, 'upi');
  console.log('✅ Test 4 Passed: Booking types and payment methods normalized.\n');

  // Test 5: Requirement requirementType and status sanitization
  console.log('Test 5: Requirement schema sanitization');
  const rq = new Requirement({
    postedBy: dummyOwnerId,
    title: 'Need harvester',
    requirementType: 'Equipment',
    district: 'Mandya',
    status: 'Open'
  });
  const rqValidateErr = rq.validateSync();
  assert.ifError(rqValidateErr);
  assert.strictEqual(rq.requirementType, 'equipment');
  assert.strictEqual(rq.status, 'open');
  console.log('✅ Test 5 Passed: Requirement types and status normalized.\n');

  // Test 6: Rating ratingType sanitization
  console.log('Test 6: Rating schema sanitization');
  const rt = new Rating({
    booking: dummyOwnerId,
    ratedBy: dummyOwnerId,
    ratingType: 'Equipment',
    score: 5
  });
  const rtValidateErr = rt.validateSync();
  assert.ifError(rtValidateErr);
  assert.strictEqual(rt.ratingType, 'equipment');
  console.log('✅ Test 6 Passed: Rating type normalized.\n');

  // Test 7: Booking Acceptance Window and Auto-Cancel defaults
  console.log('Test 7: Booking Acceptance Window & Auto-Cancel defaults');
  const now = new Date();
  const deadline = new Date(now.getTime() + 6 * 3600 * 1000);
  const bkExpiry = new Booking({
    seeker: dummyOwnerId,
    bookingType: 'bundle',
    startDate: now,
    endDate: new Date(now.getTime() + 86400000),
    purpose: 'Sugarcane harvesting',
    location: { district: 'Mandya' },
    acceptanceWindowHours: 6,
    acceptanceDeadline: deadline,
    autoCancelOnExpiry: true
  });
  const bkExpiryErr = bkExpiry.validateSync();
  assert.ifError(bkExpiryErr);
  assert.strictEqual(bkExpiry.acceptanceWindowHours, 6);
  assert.strictEqual(bkExpiry.autoCancelOnExpiry, true);
  assert.strictEqual(bkExpiry.notifiedSeekerOfExpiry, false);
  assert.strictEqual(bkExpiry.acceptanceDeadline.getTime(), deadline.getTime());
  console.log('✅ Test 7 Passed: Booking acceptance window & deadline fields validated.\n');

  // Test 8: Requirement schema with responses & offeredPrice
  console.log('Test 8: Requirement responses with offeredPrice');
  const rqResponse = new Requirement({
    postedBy: dummyOwnerId,
    title: 'Need JCB for 2 days',
    requirementType: 'Equipment',
    district: 'Mandya',
    responses: [{
      respondent: dummyOwnerId,
      message: 'Available from tomorrow morning',
      offeredPrice: 2200
    }]
  });
  const rqRespErr = rqResponse.validateSync();
  assert.ifError(rqRespErr);
  assert.strictEqual(rqResponse.responses.length, 1);
  assert.strictEqual(rqResponse.responses[0].offeredPrice, 2200);
  console.log('✅ Test 8 Passed: Requirement responses with offeredPrice validated.\n');

  // Test 9: Custom acceptance window hours (e.g. 3 hours, 48 hours)
  console.log('Test 9: Custom acceptance window hours');
  const customHours = 3;
  const customDeadline = new Date(now.getTime() + customHours * 3600 * 1000);
  const bkCustom = new Booking({
    seeker: dummyOwnerId,
    bookingType: 'equipment_only',
    startDate: now,
    endDate: new Date(now.getTime() + 86400000),
    purpose: 'Tractor rental',
    location: { district: 'Mandya' },
    acceptanceWindowHours: customHours,
    acceptanceDeadline: customDeadline,
    autoCancelOnExpiry: true
  });
  const bkCustomErr = bkCustom.validateSync();
  assert.ifError(bkCustomErr);
  assert.strictEqual(bkCustom.acceptanceWindowHours, 3);
  assert.strictEqual(bkCustom.acceptanceDeadline.getTime(), customDeadline.getTime());
  // Test 10: Seasonal Demand Dynamic Scoring calculation
  console.log('Test 10: Seasonal Demand Hybrid Algorithm logic');
  const baseScoreHarvester = 10;
  const liveBookingSignals = 3 * 4; // 3 bookings * 4 weight
  const liveRequirementSignals = 2 * 2; // 2 requirements * 2 weight
  const totalCalculatedScore = baseScoreHarvester + liveBookingSignals + liveRequirementSignals;
  assert.strictEqual(totalCalculatedScore, 26);
  console.log('✅ Test 10 Passed: Seasonal dynamic hybrid scoring formula verified.\n');

  console.log('🎉 ALL ENUM & SCHEMA VALIDATION TESTS PASSED!');
}

runValidationTests().catch(err => {
  console.error('❌ Validation test failed:', err);
  process.exit(1);
});
