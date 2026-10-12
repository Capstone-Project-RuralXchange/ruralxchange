const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { dateRange, businessDate, allowedTypes, reservationFilter } = require('./bookingRules');
const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
async function transaction(work) {
  const session = await mongoose.startSession();
  try { let result; await session.withTransaction(async () => { result = await work(session); }); return result; }
  finally { await session.endSession(); }
}
async function release(booking, session) {
  for (const [Model, id] of [[Equipment, booking.equipment], [Specialist, booking.specialist]]) {
    if (id) await Model.updateOne({ _id: id }, { $pull: { bookedDates: { bookingId: booking._id } } }, { session });
  }
}
async function expirePending() {
  const stale = await Booking.find({ status: 'pending', $or: [
    { autoCancelOnExpiry: { $ne: false }, acceptanceDeadline: { $lte: new Date() } },
    { autoCancelOnExpiry: { $ne: false }, responseDeadline: { $lte: new Date() } }, { startDate: { $lt: businessDate(new Date()) } }
  ] }).select('_id');
  for (const item of stale) await transaction(async session => {
    const booking = await Booking.findOne({ _id: item._id, status: 'pending' }).session(session);
    if (!booking) return;
    booking.status = 'cancelled'; booking.equipmentOwnerStatus = booking.equipment ? 'cancelled' : undefined; booking.specialistStatus = booking.specialist ? 'cancelled' : undefined; booking.cancellationReason = 'Request expired before provider acceptance';
    await booking.save({ session }); await release(booking, session);
  });
}
async function createBooking(user, body) {
  await expirePending();
  const { startDate, endDate, days } = dateRange(body.startDate, body.endDate);
  const shapes = { equipment_only: [true, false], specialist_only: [false, true], bundle: [true, true], professional_service: [false, true] };
  const shape = shapes[body.bookingType];
  if (!shape || shape[0] !== !!body.equipmentId || shape[1] !== !!body.specialistId) fail('Booking type does not match equipment and specialist');
  for (const id of [body.equipmentId, body.specialistId].filter(Boolean)) if (!mongoose.isValidObjectId(id)) fail('Invalid listing ID');
  const hours = Number(body.acceptanceWindowHours ?? body.responseWindowHours ?? 6);
  if (!Number.isFinite(hours) || hours < 1 || hours > 168) fail('Response window must be 1-168 hours');
  return transaction(async session => {
    const equipment = body.equipmentId ? await Equipment.findById(body.equipmentId).session(session) : null;
    const specialist = body.specialistId ? await Specialist.findById(body.specialistId).session(session) : null;
    if (body.equipmentId && !equipment || body.specialistId && !specialist) fail('Listing not found', 404);
    if (equipment && specialist && !allowedTypes(equipment).includes(specialist.specialization)) fail('Specialist is not compatible with this equipment');
    if (equipment?.owner.toString() === user.id || specialist?.user.toString() === user.id) fail('You cannot book your own listing');
    if (equipment && (days < equipment.minRentalDays || days > equipment.maxRentalDays)) fail('Dates do not meet this equipment rental limits');
    const pricing = { equipmentCost: (equipment?.pricePerDay ?? 0) * days, specialistCost: (specialist?.pricePerDay ?? 0) * days };
    pricing.platformFee = Math.round((pricing.equipmentCost + pricing.specialistCost) * .05);
    pricing.totalAmount = pricing.equipmentCost + pricing.specialistCost + pricing.platformFee;
    const booking = new Booking({ seeker: user.id, bookingType: body.bookingType,
      equipment: equipment?._id, equipmentOwner: equipment?.owner, specialist: specialist?._id, specialistOwner: specialist?.user,
      startDate, endDate, location: body.location, purpose: body.purpose, specialRequirements: body.specialRequirements,
      acceptanceWindowHours: hours, autoCancelOnExpiry: body.autoCancelOnExpiry !== false, responseWindowHours: hours, acceptanceDeadline: new Date(Date.now() + hours * 3600000), responseDeadline: new Date(Date.now() + hours * 3600000),
      equipmentOwnerStatus: equipment ? 'pending' : undefined, specialistStatus: specialist ? 'pending' : undefined, pricing });
    await booking.validate();
    for (const [Model, resource, unavailable] of [[Equipment, equipment, 'maintenance'], [Specialist, specialist, 'unavailable']]) {
      if (!resource) continue;
      const result = await Model.updateOne(reservationFilter(resource._id, startDate, endDate, unavailable),
        { $push: { bookedDates: { start: startDate, end: endDate, bookingId: booking._id } } }, { session });
      if (result.modifiedCount !== 1) fail(`${Model.modelName} was just booked by someone else or is unavailable for these dates`, 409);
    }
    await booking.save({ session }); return booking;
  });
}
async function updateStatus(user, id, body) {
  await expirePending();
  return transaction(async session => {
    const booking = await Booking.findById(id).session(session);
    if (!booking) fail('Booking not found', 404);
    const seeker = String(booking.seeker) === user.id;
    const equipmentOwner = String(booking.equipmentOwner) === user.id;
    const specialistOwner = String(booking.specialistOwner) === user.id;
    const admin = user.role === 'admin';
    if (!seeker && !equipmentOwner && !specialistOwner && !admin) fail('Not authorized', 403);
    if (['completed', 'cancelled'].includes(booking.status)) fail('This booking is already closed', 409);
    const status = body.status;
    if (status === 'cancelled') {
      if ([booking.equipmentOwnerStatus, booking.specialistStatus].includes('completed')) fail('Completed work cannot be cancelled', 409);
      booking.status = status; booking.equipmentOwnerStatus = booking.equipment ? 'cancelled' : undefined; booking.specialistStatus = booking.specialist ? 'cancelled' : undefined; booking.cancellationReason = String(body.cancellationReason || 'Cancelled by participant').slice(0, 500);
      booking.cancelledBy = user.id; await release(booking, session);
    } else {
      if (!equipmentOwner && !specialistOwner && !admin) fail('Seekers can only cancel bookings', 403);
      if (status === 'confirmed' && booking.status === 'pending') {
        if (equipmentOwner || admin && booking.equipment) booking.equipmentOwnerStatus = 'confirmed';
        if (specialistOwner || admin && booking.specialist) booking.specialistStatus = 'confirmed';
        if ((!booking.equipment || booking.equipmentOwnerStatus === 'confirmed') && (!booking.specialist || booking.specialistStatus === 'confirmed')) booking.status = 'confirmed';
      } else if (status === 'in_progress' && booking.status === 'confirmed') booking.status = status;
      else if (status === 'completed' && ['confirmed', 'in_progress'].includes(booking.status)) {
        // Bundles finish only after both providers acknowledge completion.
        if (equipmentOwner || admin && booking.equipment) booking.equipmentOwnerStatus = 'completed';
        if (specialistOwner || admin && booking.specialist) booking.specialistStatus = 'completed';
        if ((!booking.equipment || booking.equipmentOwnerStatus === 'completed') && (!booking.specialist || booking.specialistStatus === 'completed')) {
          booking.status = status; await release(booking, session);
        }
      } else fail('Invalid booking status transition', 409);
    }
    booking.completionNotes = body.completionNotes;
    await booking.save({ session }); return booking;
  });
}
module.exports = { createBooking, updateStatus, expirePending, release, transaction };
