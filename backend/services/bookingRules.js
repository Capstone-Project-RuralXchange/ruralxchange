const DAY = 86400000;
const compatibleTypes = {
  tractor: ['tractor_driver'], harvester: ['harvester_operator'],
  water_pump: ['pump_mechanic'], generator: ['electrician', 'electrical_engineer'],
  welding_machine: ['welder'], concrete_mixer: ['mason'], lighting: ['electrician'],
  rotavator: ['tractor_driver'], tiller: ['tractor_driver'], thresher: ['harvester_operator']
};
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2}))?$/;
const invalidDate = () => Object.assign(new Error('Please select valid dates (2020-2100)'), { statusCode: 400 });
function businessDate(value) {
  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    const m = ISO.exec(value.trim());
    if (!m) throw invalidDate();
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const check = new Date(Date.UTC(y, mo - 1, d));
    if (mo < 1 || mo > 12 || check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) throw invalidDate();
    if (m[4] === undefined) {
      // Date-only values are already India calendar days.
      if (y < 2020 || y > 2100) throw invalidDate();
      return check;
    }
    const [hh, mi, ss] = [Number(m[4]), Number(m[5]), Number(m[6] || 0)];
    if (hh > 23 || mi > 59 || ss > 59) throw invalidDate();
    if (m[7] !== 'Z') { const oh = Number(m[7].slice(1, 3)), om = Number(m[7].slice(4, 6)); if (oh > 23 || om > 59) throw invalidDate(); }
    date = new Date(value.trim());
  } else {
    throw invalidDate();
  }
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 2020 || date.getUTCFullYear() > 2100) throw invalidDate();
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
