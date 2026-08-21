const express = require('express');
const router = express.Router();

// Seasonal demand data based on agricultural calendar
const seasonalData = {
  // Month 1-12
  1: { // January
    season: 'Rabi Harvest Prep',
    top: ['harvester', 'thresher', 'tractor', 'labor'],
    services: ['agronomist', 'general_laborer', 'tractor_driver'],
    icon: '🌾',
    message: 'Rabi crop harvest season approaching — book harvesters early!'
  },
  2: { // February
    season: 'Rabi Harvest',
    top: ['harvester', 'thresher', 'water_pump', 'tractor'],
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
    top: ['water_pump', 'generator', 'tractor', 'sprayer'],
    services: ['pump_mechanic', 'electrician', 'agronomist'],
    icon: '☀️',
    message: 'Summer irrigation critical — water pumps in high demand'
  },
  5: { // May
    season: 'Kharif Sowing Prep',
    top: ['tractor', 'rotavator', 'tiller', 'sprayer'],
    services: ['tractor_driver', 'agronomist', 'general_laborer'],
    icon: '🌱',
    message: 'Prepare fields for Kharif season — tractors and tillers needed'
  },
  6: { // June
    season: 'Kharif Sowing (Monsoon)',
    top: ['tractor', 'rotavator', 'water_pump', 'sprayer'],
    services: ['tractor_driver', 'general_laborer', 'agronomist'],
    icon: '🌧️',
    message: 'Monsoon sowing season — peak demand for tractors and field workers'
  },
  7: { // July
    season: 'Kharif Growth',
    top: ['sprayer', 'water_pump', 'tractor', 'generator'],
    services: ['agronomist', 'pump_mechanic', 'electrician'],
    icon: '🌿',
    message: 'Crop protection spraying season — book sprayers now'
  },
  8: { // August
    season: 'Kharif Maintenance',
    top: ['sprayer', 'water_pump', 'concrete_mixer', 'generator'],
    services: ['agronomist', 'civil_engineer', 'mason', 'electrician'],
    icon: '🏗️',
    message: 'Good time for construction projects between harvest seasons'
  },
  9: { // September
    season: 'Kharif Harvest Prep',
    top: ['harvester', 'tractor', 'thresher', 'water_pump'],
    services: ['harvester_operator', 'tractor_driver', 'general_laborer'],
    icon: '🌾',
    message: 'Book harvesters now for Kharif harvest next month!'
  },
  10: { // October
    season: 'Kharif Harvest',
    top: ['harvester', 'thresher', 'tractor', 'generator'],
    services: ['harvester_operator', 'general_laborer', 'tractor_driver'],
    icon: '🚜',
    message: 'Kharif harvest peak — all harvest equipment fully booked quickly'
  },
  11: { // November
    season: 'Rabi Sowing',
    top: ['tractor', 'rotavator', 'tiller', 'water_pump'],
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

// @GET /api/seasonal/current
router.get('/current', (req, res) => {
  const month = new Date().getMonth() + 1;
  const data = seasonalData[month];
  res.json({
    success: true,
    data: {
      month,
      ...data,
      allMonths: seasonalData
    }
  });
});

// @GET /api/seasonal/all
router.get('/all', (req, res) => {
  res.json({ success: true, data: seasonalData });
});

module.exports = router;
