// Never allow a listing form to overwrite ownership or reservation state.
exports.pick = (body, fields) => Object.fromEntries(fields.filter(k => body[k] !== undefined).map(k => [k, body[k]]));
exports.equipmentFields = ['title','category','description','images','pricePerDay','pricePerHour','district','state','village','address','condition','specifications','availabilityStatus','requiresSpecialist','compatibleSpecialistTypes','minRentalDays','maxRentalDays'];
exports.specialistFields = ['specialization','displayTitle','qualifications','experience','pricePerDay','pricePerHour','district','state','village','address','skills','languages','availabilityStatus'];
