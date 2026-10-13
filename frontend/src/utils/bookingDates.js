// API reservations are business-day labels encoded at UTC midnight, not instants.
export function localBookingDay(value) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}
export function bookingIntervals(dates) {
  return dates.map(d => ({ start: localBookingDay(d.start), end: localBookingDay(d.end) })).filter(d => d.start && d.end);
}
export function nextBookingStart(start, intervals) {
  if (!start) return null;
  return intervals.filter(d => d.start > start).map(d => d.start).sort((a, b) => a - b)[0] || null;
}
export function rangeConflict(start, end, intervals) {
  return Boolean(start && end && intervals.some(d => start <= d.end && end >= d.start));
}
