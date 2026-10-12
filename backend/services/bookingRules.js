const DAY = 86400000;
const compatibleTypes = {
  tractor: ['tractor_driver'], harvester: ['harvester_operator'],
  water_pump: ['pump_mechanic'], generator: ['electrician', 'electrical_engineer'],
  welding_machine: ['welder'], concrete_mixer: ['mason'], lighting: ['electrician'],
  rotavator: ['tractor_driver'], tiller: ['tractor_driver'], thresher: ['harvester_operator']
};
function businessDate(value) {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime()) || date.getUTCFullYear() < 2020 || date.getUTCFullYear() > 2100) {
    throw Object.assign(new Error('Please select valid dates (2020-2100)'), { statusCode: 400 });
  }
  // The marketplace uses India calendar days, regardless of the browser timezone.
  return new Date(new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 10) + 'T00:00:00Z');
}
function dateRange(start, end, now = new Date()) {
  const startDate = businessDate(start), endDate = businessDate(end);
  if (startDate < businessDate(now) || endDate < startDate) {
    throw Object.assign(new Error('Dates must be today or later, with end on or after start'), { statusCode: 400 });
  }
  return { startDate, endDate, days: (endDate - startDate) / DAY + 1 };
}
function allowedTypes(equipment) {
  return equipment.compatibleSpecialistTypes?.length ? equipment.compatibleSpecialistTypes : (compatibleTypes[equipment.category] || []);
}
function reservationFilter(id, start, end, unavailable) {
  return { _id: id, isActive: true, availabilityStatus: { $ne: unavailable },
    bookedDates: { $not: { $elemMatch: { start: { $lte: end }, end: { $gte: start } } } } };
}
module.exports = { dateRange, businessDate, allowedTypes, reservationFilter };
