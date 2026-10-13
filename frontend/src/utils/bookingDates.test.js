import { localBookingDay, bookingIntervals, nextBookingStart, rangeConflict } from './bookingDates';
test('reservation day labels are local midnight including the first booked day', () => {
  const d=localBookingDay('2026-10-13T00:00:00.000Z');
  expect(d.getDate()).toBe(13);expect(d.getHours()).toBe(0);
  expect(localBookingDay(null)).toBeNull();
});
test('same-day, inclusive endpoints, crossing ranges and adjacent free ranges', () => {
  const intervals=bookingIntervals([{start:'2026-10-13T00:00:00Z',end:'2026-10-14T00:00:00Z'},{start:'2026-10-20',end:'2026-10-21'}]);
  const day=n=>new Date(2026,9,n);
  for(const [a,b] of [[13,13],[14,14],[12,15],[17,22],[20,21]]) expect(rangeConflict(day(a),day(b),intervals)).toBe(true);
  for(const [a,b] of [[15,16],[17,19],[22,23]]) expect(rangeConflict(day(a),day(b),intervals)).toBe(false);
  expect(nextBookingStart(day(17),intervals)).toEqual(day(20));expect(nextBookingStart(day(22),intervals)).toBeNull();
});
