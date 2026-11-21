/** Run once, during a maintenance window with the previous backend stopped.
 * Rebuild date reservations from active booking records. Requires MongoDB replica set.
 * Never use the destructive seed script for this migration.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { transaction, expirePending } = require('../services/bookings');
const { businessDate } = require('../services/bookingRules');
async function migrate() {
  await Booking.updateMany({status:'pending',responseDeadline:{$exists:false}}, [{ $set:{ responseDeadline:{ $ifNull:['$acceptanceDeadline', { $add:['$createdAt',24*3600000] }] },responseWindowHours:{ $ifNull:['$acceptanceWindowHours',24] } }}]);
  await expirePending();
  for (const [Model,field] of [[Equipment,'equipment'],[Specialist,'specialist']]) {
    const ids = await Model.find().select('_id');
    for(const item of ids) await transaction(async session => {
      const resource=await Model.findById(item._id).session(session);
      const bookings=await Booking.find({[field]:item._id,status:{$in:['pending','confirmed','in_progress']}}).session(session);
      const ranges=bookings.map(b=>({start:businessDate(b.startDate),end:businessDate(b.endDate),bookingId:b._id}));
      resource.bookedDates=ranges;
      if(resource.availabilityStatus==='booked')resource.availabilityStatus='available';
      await resource.save({session});
      for(const booking of bookings) {
        if(booking.equipment && !booking.equipmentOwnerStatus)booking.equipmentOwnerStatus=booking.status==='pending'?'pending':'confirmed';
        if(booking.specialist && !booking.specialistStatus)booking.specialistStatus=booking.status==='pending'?'pending':'confirmed';
        await booking.save({session});
      }
    });
  }
}
if(require.main===module) mongoose.connect(process.env.MONGODB_URI).then(migrate).then(()=>mongoose.disconnect()).catch(err=>{console.error('Migration failed:',err.message);process.exitCode=1;mongoose.disconnect();});
module.exports={migrate};
