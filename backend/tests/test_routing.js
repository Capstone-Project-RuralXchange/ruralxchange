/**
 * Automated verification test for OSRM Road Distance & Routing Engine
 * Run: node backend/tests/test_routing.js
 */

const assert = require('assert');
const { getRoadDistance, formatDrivingTime, enrichItemsWithRoadDistance, routeCache } = require('../utils/routing');
const { haversineDistance, KARNATAKA_DISTRICTS_COORDS, KARNATAKA_DISTRICT_COORDS } = require('../utils/geocode');

async function runTests() {
  console.log('🚗 Starting OSRM Road Distance & Routing Engine Tests...\n');

  // Test 1: formatDrivingTime Helper
  console.log('Test 1: formatDrivingTime formatting helper');
  assert.strictEqual(formatDrivingTime(0), '< 1 min');
  assert.strictEqual(formatDrivingTime(1), '1 min');
  assert.strictEqual(formatDrivingTime(25), '25 mins');
  assert.strictEqual(formatDrivingTime(60), '1 hr');
  assert.strictEqual(formatDrivingTime(75), '1 hr 15 mins');
  assert.strictEqual(formatDrivingTime(120), '2 hrs');
  assert.strictEqual(formatDrivingTime(130), '2 hrs 10 mins');
  console.log('✅ Test 1 Passed: Duration strings formatted accurately.\n');

  // Test 2: Same location distance
  console.log('Test 2: Same coordinate (0 distance, 0 duration)');
  const samePoint = await getRoadDistance(12.5222, 76.8951, 12.5222, 76.8951);
  assert.strictEqual(samePoint.distanceKm, 0);
  assert.strictEqual(samePoint.durationMinutes, 0);
  assert.strictEqual(samePoint.durationText, '0 mins');
  assert.strictEqual(samePoint.isRoadDistance, true);
  console.log('✅ Test 2 Passed: Same point returns 0 km / 0 mins.\n');

  // Test 3: Real road distance calculation between Mandya and Mysuru
  console.log('Test 3: Mandya (12.5222, 76.8951) to Mysuru (12.2958, 76.6394)');
  const mandyaToMysuru = await getRoadDistance(12.5222, 76.8951, 12.2958, 76.6394);
  console.log('   Result:', mandyaToMysuru);
  assert(mandyaToMysuru.distanceKm > 30 && mandyaToMysuru.distanceKm < 65, 'Distance should be ~40-50 km');
  assert(mandyaToMysuru.durationMinutes > 20, 'Duration should be at least 20 mins');
  assert(typeof mandyaToMysuru.durationText === 'string', 'DurationText must be a string');
  console.log(`✅ Test 3 Passed: Real Road Distance = ${mandyaToMysuru.distanceKm} km, Duration = ${mandyaToMysuru.durationText} (${mandyaToMysuru.isRoadDistance ? 'OSRM Live' : 'Fallback'}).\n`);

  // Test 4: Cache hit check
  console.log('Test 4: Route Caching');
  const cacheSizeBefore = routeCache.size;
  const cachedCall = await getRoadDistance(12.5222, 76.8951, 12.2958, 76.6394);
  assert.strictEqual(cachedCall.distanceKm, mandyaToMysuru.distanceKm);
  assert.strictEqual(routeCache.size, cacheSizeBefore, 'Cache should serve repeated query without new entries');
  console.log('✅ Test 4 Passed: Repeated query served from memory cache instantaneously.\n');

  // Test 5: enrichItemsWithRoadDistance
  console.log('Test 5: Batch Item Road Distance Enrichment');
  const mockSeeker = { lat: 12.9716, lng: 77.5946 }; // Bengaluru
  const mockItems = [
    {
      _id: 'item1',
      title: 'Mahindra Tractor',
      district: 'Ramanagara',
      location: { type: 'Point', coordinates: [77.2795, 12.7159] } // Ramanagara coords [lng, lat]
    },
    {
      _id: 'item2',
      title: 'Paddy Harvester',
      district: 'Mandya',
      location: { type: 'Point', coordinates: [76.8951, 12.5222] } // Mandya coords [lng, lat]
    }
  ];

  const enriched = await enrichItemsWithRoadDistance(mockSeeker, mockItems);
  assert.strictEqual(enriched.length, 2);
  assert(enriched[0].roadDistanceKm != null, 'Item 1 must have roadDistanceKm');
  assert(enriched[0].drivingTimeMinutes != null, 'Item 1 must have drivingTimeMinutes');
  assert(enriched[1].roadDistanceKm != null, 'Item 2 must have roadDistanceKm');
  // Ramanagara should be closer to Bengaluru than Mandya
  assert(enriched[0].roadDistanceKm < enriched[1].roadDistanceKm, 'Ramanagara must be closer than Mandya');
  console.log(`   Item 1 (${enriched[0].district}): ${enriched[0].roadDistanceKm} km, ${enriched[0].drivingTimeText}`);
  console.log(`   Item 2 (${enriched[1].district}): ${enriched[1].roadDistanceKm} km, ${enriched[1].drivingTimeText}`);
  console.log('✅ Test 5 Passed: Items enriched and relative road ordering verified.\n');

  console.log('🎉 ALL ROAD DISTANCE & ROUTING TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
