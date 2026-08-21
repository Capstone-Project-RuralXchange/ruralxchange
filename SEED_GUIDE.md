# 🌾 RuralXchange — Seed Data Guide

This guide explains all the dummy data included in `backend/seed.js`, how to run it, and what you can test with each account.

---

## How to Run

```bash
# Make sure MongoDB is running first
# Then from the backend/ folder:

cd backend
node seed.js
```

Expected output:
```
✅  Connected to MongoDB
🗑️   Cleared all existing data
👥  Created 13 users  (4 seekers · 4 providers · 4 specialists · 1 admin)
🚜  Created 20 equipment listings
👷  Created 10 specialist profiles
📋  Created 12 requirements
📅  Created 15 bookings
⭐  Created 7 ratings
══════════════════════════════════════
  🌾  RuralXchange Database Seeded Successfully
```

> ⚠️ **Warning:** Running seed.js clears ALL existing data before inserting. Do not run on a production database.

---

## Test Accounts

### Seekers (People who need equipment/services)

| Name | Phone | Password | District | Village |
|------|-------|----------|----------|---------|
| Krishnamurthy B. | 9100000001 | pass123 | Mandya | Maddur |
| Savitha Naik | 9100000002 | pass123 | Tumkur | Sira |
| Prakash Gowda | 9100000003 | pass123 | Hassan | Alur |
| Anitha Reddy | 9100000004 | pass123 | Kolar | Bangarpet |

### Providers (Equipment owners)

| Name | Phone | Password | District | Village |
|------|-------|----------|----------|---------|
| Ramu Gowda | 9200000001 | pass123 | Mandya | Kirugavalu |
| Manjula Devi | 9200000002 | pass123 | Hassan | Sakleshpur |
| Suresh Nagaraj | 9200000003 | pass123 | Mysuru | Nanjangud |
| Venkatesh Rao | 9200000004 | pass123 | Davangere | Honnali |

### Specialists (Skilled workers)

| Name | Phone | Password | District | Specialization |
|------|-------|----------|----------|----------------|
| Shiva Kumar | 9300000001 | pass123 | Mysuru | Tractor Driver |
| Vijay Engineer | 9300000002 | pass123 | Bengaluru Rural | Electrician / Engineer |
| Basavanna Patil | 9300000003 | pass123 | Dharwad | Mason / Welder |
| Nirmala Bai | 9300000004 | pass123 | Raichur | Agronomist / Animal Health |

### Admin

| Name | Phone | Password |
|------|-------|----------|
| Admin RuralXchange | 9000000000 | admin123 |

---

## Equipment Listings (20 items)

### Tractors (4)

| Title | Owner | District | Price/Day | Requires Specialist |
|-------|-------|----------|-----------|---------------------|
| Mahindra 575 DI – 45HP | Ramu Gowda | Mandya | ₹2,200 | Yes (Tractor Driver) |
| John Deere 5050D – 50HP | Ramu Gowda | Mandya | ₹2,800 | Yes (Tractor Driver) |
| Sonalika DI 750 III – 75HP | Venkatesh Rao | Davangere | ₹3,500 | Yes (Tractor Driver) |

### Harvesters (1)

| Title | Owner | District | Price/Day | Notes |
|-------|-------|----------|-----------|-------|
| Kubota DC-70 Combine Harvester | Manjula Devi | Hassan | ₹5,500 | Operator required |

### Water Pumps (2)

| Title | Owner | District | Price/Day |
|-------|-------|----------|-----------|
| Kirloskar Star-1 – 5HP | Suresh Nagaraj | Mysuru | ₹500 |
| Texmo TJ7.5 Submersible – 7.5HP | Venkatesh Rao | Davangere | ₹750 |

### Generators (2)

| Title | Owner | District | Price/Day |
|-------|-------|----------|-----------|
| Honda EP5000CX – 5KVA | Suresh Nagaraj | Mysuru | ₹1,200 |
| Koel Green – 15KVA | Ramu Gowda | Mandya | ₹2,800 |

### Sprayers (3)

| Title | Owner | District | Price/Day |
|-------|-------|----------|-----------|
| Neptune 16L Battery Sprayer | Venkatesh Rao | Davangere | ₹300 |
| Boom Sprayer (12m Tractor Mounted) | Suresh Nagaraj | Mysuru | ₹1,200 |
| Agricultural Drone – 10L (UAV) | Suresh Nagaraj | Mysuru | ₹4,000 |

### Other Equipment

| Title | Category | Owner | District | Price/Day |
|-------|----------|-------|----------|-----------|
| Fieldking Super Seeder Rotavator 7ft | Rotavator | Manjula Devi | Hassan | ₹1,800 |
| Vikram Multi-Crop Thresher – 7.5HP | Thresher | Ramu Gowda | Mandya | ₹1,400 |
| Jaypee 1-Bag Concrete Mixer | Concrete Mixer | Venkatesh Rao | Davangere | ₹800 |
| JBL Line Array Sound System – 2000W | Sound System | Suresh Nagaraj | Mysuru | ₹3,500 |
| LED Stage Lighting Set | Lighting | Manjula Devi | Hassan | ₹2,200 |
| Lincoln Electric Welding Machine | Welding Machine | Venkatesh Rao | Davangere | ₹600 |
| Honda FJ500 Power Tiller – 5HP | Tiller | Ramu Gowda | Mandya | ₹700 |
| Bosch SDS-Max Rotary Hammer Drill | Drill | Suresh Nagaraj | Mysuru | ₹500 |
| Aluminum Tent Structure – 40×60 ft | Tent Structure | Manjula Devi | Hassan | ₹4,500 |

---

## Specialist Profiles (10)

| Display Title | Specialization | District | Rate/Day | Experience | Verified | Jobs Done |
|---------------|----------------|----------|----------|------------|----------|-----------|
| Senior Tractor & Harvester Operator | tractor_driver | Mysuru | ₹700 | 12 yrs | ✅ | 87 |
| Licensed Electrical Contractor | electrician | Bengaluru Rural | ₹900 | 9 yrs | ✅ | 64 |
| Pump Mechanic & Irrigation Technician | pump_mechanic | Bengaluru Rural | ₹750 | 7 yrs | ✅ | 52 |
| Master Mason & Construction Supervisor | mason | Dharwad | ₹650 | 18 yrs | ❌ | 143 |
| Certified Arc & MIG Welder | welder | Dharwad | ₹700 | 11 yrs | ✅ | 78 |
| Agricultural Scientist & Crop Advisor | agronomist | Raichur | ₹1,500 | 6 yrs | ✅ | 29 |
| Kubota Combine Harvester Operator | harvester_operator | Mysuru | ₹850 | 8 yrs | ✅ | 61 |
| Civil Engineer – Farm Structures | civil_engineer | Bengaluru Rural | ₹1,800 | 4 yrs | ✅ | 22 |
| Skilled Carpenter – Farm & Household | carpenter | Dharwad | ₹600 | 14 yrs | ❌ | 110 |
| Livestock Health Worker & Vaccinator | animal_health_worker | Raichur | ₹1,000 | 9 yrs | ✅ | 93 |

---

## Requirements / Notice Board (12 posts)

| Title | Type | Posted By | District | Budget | Urgency |
|-------|------|-----------|----------|--------|---------|
| Tractor for 3-day paddy ploughing | Bundle | Krishnamurthy B. | Mandya | ₹5k–8k | 🔴 Urgent |
| Water pump for summer irrigation | Equipment | Savitha Naik | Tumkur | ₹8k–12k | Normal |
| Electrician – bore well motor installation | Specialist | Prakash Gowda | Hassan | ₹1.5k–2.5k | 🔴 Urgent |
| Wedding sound system + operator | Bundle | Anitha Reddy | Kolar | ₹5k–8k | Normal |
| Agronomist for soil testing & crop plan | Specialist | Krishnamurthy B. | Mandya | ₹3k–6k | Normal |
| Combine harvester for paddy harvest | Bundle | Savitha Naik | Tumkur | ₹18k–25k | 🔴 Urgent |
| Mason for cattle shed repair | Specialist | Prakash Gowda | Hassan | ₹3k–4k | 🔴 Urgent |
| Generator for 2-day village fair | Equipment | Anitha Reddy | Kolar | ₹4k–6k | Normal |
| Animal health worker – cattle vaccination | Specialist | Krishnamurthy B. | Mandya | ₹2k–4k | Normal |
| Drip irrigation layout – tomato farm | Specialist | Savitha Naik | Tumkur | ₹5k–9k | Normal |
| Tent structure for wedding | Equipment | Prakash Gowda | Hassan | ₹8k–14k | Normal |
| Power sprayer – pest attack on paddy | Equipment | Anitha Reddy | Kolar | ₹600–1.2k | 🔴 Urgent |

---

## Bookings (15 records)

### Completed (5)
These have associated ratings already seeded.

| Equipment / Service | Seeker | Days | Total | Payment |
|---------------------|--------|------|-------|---------|
| Mahindra 575 DI + Tractor Driver (Bundle) | Krishnamurthy B. | 3 days | ₹9,135 | Cash ✅ |
| Kirloskar Water Pump (Equipment Only) | Savitha Naik | 10 days | ₹5,250 | UPI ✅ |
| Electrician – Motor Installation (Specialist Only) | Prakash Gowda | 1 day | ₹1,890 | Cash ✅ |
| Kubota Harvester + Operator (Bundle) | Krishnamurthy B. | 3 days | ₹20,003 | Bank Transfer ✅ |
| JBL Sound System (Equipment Only) | Anitha Reddy | 1 day | ₹3,675 | Cash ✅ |

### Confirmed / Upcoming (3)
| Equipment / Service | Seeker | Status |
|---------------------|--------|--------|
| John Deere 5050D + Tractor Driver (Bundle) | Savitha Naik | Confirmed |
| Agronomist – Soil Testing (Specialist Only) | Prakash Gowda | Confirmed |
| Fieldking Rotavator (Equipment Only) | Krishnamurthy B. | Confirmed |

### Pending (3)
| Equipment / Service | Seeker | Status |
|---------------------|--------|--------|
| JBL Sound + Specialist (Bundle) | Anitha Reddy | Pending |
| Mason – Farm Shed Repair (Specialist Only) | Savitha Naik | Pending |
| Jaypee Concrete Mixer (Equipment Only) | Prakash Gowda | Pending |

### In Progress (2)
| Equipment / Service | Seeker |
|---------------------|--------|
| Livestock Health Worker – Cattle Vaccination | Krishnamurthy B. |
| Neptune Sprayer + Operator (Bundle) | Anitha Reddy |

### Cancelled (2)
| Equipment / Service | Reason |
|---------------------|--------|
| Honda Generator | Owner prior commitment |
| Welder – Gate Fabrication | Seeker found local welder |

---

## Ratings (7 reviews)

All ratings are for completed bookings. They include both equipment and specialist reviews.

| What Was Rated | Rated By | Score | Highlights |
|----------------|----------|-------|------------|
| Mahindra 575 DI Tractor | Krishnamurthy B. | ⭐ 5/5 | Excellent condition, well maintained |
| Tractor Driver (Shiva Kumar) | Krishnamurthy B. | ⭐ 5/5 | Professional, adjusted depth perfectly |
| Kirloskar Water Pump | Savitha Naik | ⭐ 4/5 | Reliable, minor fuel leak day 8 |
| Electrician (Vijay Engineer) | Prakash Gowda | ⭐ 5/5 | Clean wiring, BESCOM compliant |
| Kubota DC-70 Harvester | Krishnamurthy B. | ⭐ 4/5 | Efficient, small morning delay |
| Harvester Operator | Krishnamurthy B. | ⭐ 5/5 | Handled wet paddy expertly |
| JBL Sound System | Anitha Reddy | ⭐ 5/5 | Crystal clear, full hall coverage |

---

## What Each Role Sees After Login

### Seeker (e.g. 9100000001 — Krishnamurthy B.)
- **Dashboard:** 5 total bookings (2 completed, 1 confirmed, 1 in-progress, 1 upcoming)
- **Requirements:** 3 of his requirements visible on notice board
- Can browse 20 equipment listings and 10 specialist profiles
- Can create new bookings

### Provider (e.g. 9200000001 — Ramu Gowda)
- **Dashboard:** 5 equipment listings (2 tractors + generator + thresher + tiller)
- Can see incoming bookings for his equipment (Mahindra, John Deere, Koel Generator, etc.)
- Can accept/decline pending bookings (3 pending show up)
- Earnings visible for completed bookings

### Specialist (e.g. 9300000001 — Shiva Kumar)
- **Dashboard:** Profile has 87 completed jobs, 4.8 rating from seed data
- Specialist profile created under this user: "Senior Tractor & Harvester Operator"
- Can see bookings that include his specialist profile
- Can view his rating and reviews

### Admin (9000000000)
- Full access to all data

---

## Troubleshooting

**"ValidationError: district: Path `district` is required"**
Make sure your `.env` has a working `MONGODB_URI`. The seed file maps districts from provider/specialist users to their equipment.

**"Authentication error" after seeding**
Clear browser localStorage and log in again with the new credentials.

**Seeding fails on re-run**
This is normal if MongoDB isn't running. Start MongoDB with `mongod` or use your Atlas connection string.

**Want to reset to fresh seed data?**
Simply run `node seed.js` again — it clears everything before inserting.

---

## Adding Your Own Data

You can extend the seed file by:

1. **Adding more users** — add entries to the `usersData` array
2. **Adding equipment** — add to `equipmentData` with correct `ownerIdx` (0–3 for providers)
3. **Adding specialists** — add to `specialistData` with correct `userIdx` (0–3 for specialist users)
4. **Adding requirements** — add to `requirementsData` with correct `seekerIdx` (0–3 for seekers)

After editing, re-run: `node seed.js`
