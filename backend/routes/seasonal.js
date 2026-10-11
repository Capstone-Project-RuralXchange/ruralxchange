const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Requirement = require('../models/Requirement');

// Baseline agricultural knowledge calendar (Karnataka Agro-Climatic Cycle)
const baselineSeasonalData = {
  1: { // January
    season: 'Rabi Harvest Prep',
    top: ['harvester', 'thresher', 'baler', 'tractor'],
    services: ['agronomist', 'general_laborer', 'tractor_driver'],
    icon: '🌾',
    message: 'Rabi crop harvest season approaching — book harvesters early!'
  },
  2: { // February
    season: 'Rabi Harvest',
    top: ['harvester', 'thresher', 'baler', 'tractor_trolley'],
    services: ['harvester_operator', 'general_laborer', 'agronomist'],
    icon: '🚜',
    message: 'Peak harvest season — harvesters and threshers in high demand'
  },
  3: { // March
    season: 'Post-Harvest & Wedding Season',
    top: ['generator', 'tent_structure', 'sound_system', 'lighting'],
    services: ['electrician', 'general_laborer', 'civil_engineer'],
    icon: '🎉',
    message: 'Wedding and function season — book generators and tents!'
  },
  4: { // April
    season: 'Summer Prep',
    top: ['water_pump', 'generator', 'chaff_cutter', 'earth_auger'],
    services: ['pump_mechanic', 'electrician', 'agronomist'],
    icon: '☀️',
    message: 'Summer irrigation critical — water pumps in high demand'
  },
  5: { // May
    season: 'Kharif Sowing Prep',
    top: ['tractor', 'rotavator', 'cultivator', 'laser_leveler'],
    services: ['tractor_driver', 'agronomist', 'general_laborer'],
    icon: '🌱',
    message: 'Prepare fields for Kharif season — tractors and tillers needed'
  },
  6: { // June
    season: 'Kharif Sowing (Monsoon)',
    top: ['tractor', 'seed_drill', 'rotavator', 'tiller'],
    services: ['tractor_driver', 'general_laborer', 'agronomist'],
    icon: '🌧️',
    message: 'Monsoon sowing season — peak demand for tractors and field workers'
  },
  7: { // July
    season: 'Kharif Growth',
    top: ['power_weeder', 'sprayer', 'drone', 'water_pump'],
    services: ['agronomist', 'pump_mechanic', 'electrician'],
    icon: '🌿',
    message: 'Crop protection spraying season — book sprayers now'
  },
  8: { // August
    season: 'Kharif Maintenance',
    top: ['sprayer', 'drone', 'concrete_mixer', 'water_pump'],
    services: ['agronomist', 'civil_engineer', 'mason', 'electrician'],
    icon: '🏗️',
    message: 'Good time for construction projects between harvest seasons'
  },
  9: { // September
    season: 'Kharif Harvest Prep',
    top: ['harvester', 'tractor_trolley', 'thresher', 'baler'],
    services: ['harvester_operator', 'tractor_driver', 'general_laborer'],
    icon: '🌾',
    message: 'Book harvesters now for Kharif harvest next month!'
  },
  10: { // October
    season: 'Kharif Harvest',
    top: ['harvester', 'thresher', 'baler', 'tractor_trolley'],
    services: ['harvester_operator', 'general_laborer', 'tractor_driver'],
    icon: '🚜',
    message: 'Kharif harvest peak — all harvest equipment fully booked quickly'
  },
  11: { // November
    season: 'Rabi Sowing',
    top: ['tractor', 'seed_drill', 'rotavator', 'cultivator'],
    services: ['tractor_driver', 'agronomist', 'general_laborer'],
    icon: '🌱',
    message: 'Rabi sowing season — prepare fields for winter crops'
  },
  12: { // December
    season: 'Rabi Growth & Festival Season',
    top: ['water_pump', 'generator', 'tent_structure', 'sound_system'],
    services: ['pump_mechanic', 'electrician', 'general_laborer'],
    icon: '🎊',
    message: 'Festival and wedding season — generators and event equipment in demand'
  }
};

/**
 * Dynamic Hybrid Aggregation Algorithm
 * Combines Agro-Climatic Baseline + Real Platform Usage (Bookings + Notice Board Requirements)
 */
let cachedSeasonalData = null;
let lastSeasonalDataUpdate = 0;
const SEASONAL_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function computeDynamicSeasonalData() {
  if (cachedSeasonalData && (Date.now() - lastSeasonalDataUpdate < SEASONAL_CACHE_TTL)) {
    return cachedSeasonalData;
  }

  try {
    const since = new Date(Date.now() - 45 * 24 * 3600 * 1000); // 45-day rolling platform usage window

    // 1. Live Equipment Bookings Aggregation
    const eqCollectionName = Equipment.collection ? Equipment.collection.name : 'equipments';
    const eqBookings = await Booking.aggregate([
      { $match: { equipment: { $exists: true, $ne: null }, createdAt: { $gte: since } } },
      {
        $lookup: {
          from: eqCollectionName,
          localField: 'equipment',
          foreignField: '_id',
          as: 'eqDoc'
        }
      },
      { $unwind: { path: '$eqDoc', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$eqDoc.category',
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Live Specialist Bookings Aggregation
    const spCollectionName = Specialist.collection ? Specialist.collection.name : 'specialists';
    const spBookings = await Booking.aggregate([
      { $match: { specialist: { $exists: true, $ne: null }, createdAt: { $gte: since } } },
      {
        $lookup: {
          from: spCollectionName,
          localField: 'specialist',
          foreignField: '_id',
          as: 'spDoc'
        }
      },
      { $unwind: { path: '$spDoc', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$spDoc.specialization',
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Live Requirements Notice Board Signals
    const reqStats = await Requirement.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $facet: {
          eqReqs: [
            { $match: { 'equipmentNeeded.category': { $exists: true, $ne: null } } },
            { $group: { _id: '$equipmentNeeded.category', count: { $sum: 1 } } }
          ],
          spReqs: [
            { $match: { 'specialistNeeded.specialization': { $exists: true, $ne: null } } },
            { $group: { _id: '$specialistNeeded.specialization', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // Weight live usage scores: Bookings = 4x, Requirements = 2x
    const eqLiveMap = {};
    eqBookings.forEach(b => {
      if (b._id) eqLiveMap[b._id] = (eqLiveMap[b._id] || 0) + b.count * 4;
    });
    const eqReqList = reqStats[0]?.eqReqs || [];
    eqReqList.forEach(r => {
      if (r._id) eqLiveMap[r._id] = (eqLiveMap[r._id] || 0) + r.count * 2;
    });

    const spLiveMap = {};
    spBookings.forEach(b => {
      if (b._id) spLiveMap[b._id] = (spLiveMap[b._id] || 0) + b.count * 4;
    });
    const spReqList = reqStats[0]?.spReqs || [];
    spReqList.forEach(r => {
      if (r._id) spLiveMap[r._id] = (spLiveMap[r._id] || 0) + r.count * 2;
    });

    const currentMonth = new Date().getMonth() + 1;
    const totalLiveSignals = Object.keys(eqLiveMap).length + Object.keys(spLiveMap).length;

    // Deep clone baseline calendar
    const calendar = JSON.parse(JSON.stringify(baselineSeasonalData));

    // Dynamically re-rank current month using weighted hybrid formula
    const curBase = calendar[currentMonth];
    if (curBase) {
      // Re-rank equipment
      const allEqCategories = Array.from(new Set([...curBase.top, ...Object.keys(eqLiveMap)]));
      const scoredEq = allEqCategories.map(cat => {
        const baseIndex = curBase.top.indexOf(cat);
        const baseScore = baseIndex >= 0 ? (10 - baseIndex * 2) : 1;
        const liveScore = eqLiveMap[cat] || 0;
        return { category: cat, totalScore: baseScore + liveScore, liveSignals: liveScore };
      });
      scoredEq.sort((a, b) => b.totalScore - a.totalScore);
      curBase.top = scoredEq.slice(0, 4).map(s => s.category);

      // Re-rank services
      const allSpCategories = Array.from(new Set([...curBase.services, ...Object.keys(spLiveMap)]));
      const scoredSp = allSpCategories.map(svc => {
        const baseIndex = curBase.services.indexOf(svc);
        const baseScore = baseIndex >= 0 ? (10 - baseIndex * 2) : 1;
        const liveScore = spLiveMap[svc] || 0;
        return { specialization: svc, totalScore: baseScore + liveScore, liveSignals: liveScore };
      });
      scoredSp.sort((a, b) => b.totalScore - a.totalScore);
      curBase.services = scoredSp.slice(0, 4).map(s => s.specialization);

      curBase.isLiveDynamic = totalLiveSignals > 0;
      curBase.totalSignals = totalLiveSignals;
    }

    const finalResult = { calendar, currentMonth, isLiveDynamic: totalLiveSignals > 0, totalLiveSignals };
    cachedSeasonalData = finalResult;
    lastSeasonalDataUpdate = Date.now();
    return finalResult;
  } catch (err) {
    console.error('Dynamic seasonal aggregation fallback:', err.message);
    const currentMonth = new Date().getMonth() + 1;
    return {
      calendar: baselineSeasonalData,
      currentMonth,
      isLiveDynamic: false,
      totalLiveSignals: 0
    };
  }
}

// @GET /api/seasonal/current - Dynamic current month + calendar
router.get('/current', async (req, res) => {
  try {
    const result = await computeDynamicSeasonalData();
    const currentMonthData = result.calendar[result.currentMonth];
    res.json({
      success: true,
      data: {
        month: result.currentMonth,
        isLiveDynamic: result.isLiveDynamic,
        totalLiveSignals: result.totalLiveSignals,
        ...currentMonthData,
        allMonths: result.calendar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/seasonal/all - Dynamic calendar for all months
router.get('/all', async (req, res) => {
  try {
    const result = await computeDynamicSeasonalData();
    res.json({
      success: true,
      data: result.calendar,
      meta: {
        isLiveDynamic: result.isLiveDynamic,
        totalLiveSignals: result.totalLiveSignals,
        currentMonth: result.currentMonth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
