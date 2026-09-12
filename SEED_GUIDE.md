# 🌾 RuralXchange — Comprehensive Seed Data & Admin Guide

This guide explains all sample data included in `backend/seed.js`, all test accounts across roles, and how to use the **Admin RBAC User Management Console**.

---

## How to Seed the Database

```bash
# From the project root or backend folder:
npm run seed
# or
node backend/seed.js
```

### Expected Output:
```text
🌱 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas
🗑️  Cleared all existing collections
👥 Creating 38 users...
✅ Created 38 users (10 Seekers · 10 Providers · 16 Specialists · 2 Admins)
🚜 Created 22 equipment listings across all 15 categories
👷 Created 16 specialist profiles across all 16 skills
📋 Created 12 notice board requirements
📅 Created 7 bookings
⭐ Created 3 ratings & reviews
═════════════════════════════════════════════════════════════════
  🌾  RuralXchange Database Seeded Successfully with Full Coverage
═════════════════════════════════════════════════════════════════
```

---

## 🔐 Test Accounts by Role

All accounts use the following standard passwords:
- **Seeker / Provider / Specialist Accounts**: `password123`
- **Admin Accounts**: `admin123`

---

### 1. 👑 Admin Accounts (RBAC User Management)

| Name | Phone / Login | Password | Role | District / Note |
|------|---------------|----------|------|-----------------|
| **Admin Console** | `admin@ruralxchange.in` / `9845000000` | `admin123` | `admin` | Bengaluru Urban (Full RBAC Console at `/admin/users`) |

> 💡 **Admin Console Access**: Log in with `admin@ruralxchange.in` / `admin123` to access the **"👑 Admin RBAC"** console in the navigation bar or visit [`/admin/users`](http://localhost:3000/admin/users).

---

### 2. 🔍 Key Test Scenario Personas

| Role | Name | Phone / Login | District | Key Scenario to Test |
|------|------|---------------|----------|----------------------|
| **Seeker (Alert Banner & Ratings)** | Ramesh Gowda | `9845011111` | Mandya | **Seeker Alert Popup**: Log in and visit Dashboard to see the auto-cancelled booking alert with "Search Alternatives" button, unaccepted pending warning, and rate completed bookings. |
| **Equipment Provider** | Suresh Patel | `9845022222` | Belagavi | **Incoming Bookings**: Log in to view 3 listed tractors/rotavators, incoming seeker requests, and acceptance deadlines. |
| **Professional Specialist** | Dr. Ananya Rao | `9845033333` | Bengaluru Urban | **Professional Tier**: Certified Agronomist profile with degree certificates, ₹1,200/day advisory booking flow. |
| **Skilled Operator** | Manjunath K | `9845044444` | Mysuru | **Bundle Booking Operator**: Tractor driver available for standalone hire or bundled with tractors. |

---

### 3. 🔍 Additional Seekers (Farmers & Hirers)

| Name | Phone | Password | District | Village | Speciality / Bio |
|------|-------|----------|----------|---------|------------------|
| Basavarajappa K. | `9845022223` | `password123` | Dharwad | Navalgund | Cotton & Chili grower |
| Ningappa Biradar | `9845022224` | `password123` | Vijayapura | Indi | Pomegranate & Lime orchard |
| Chennamma Patil | `9845022225` | `password123` | Belagavi | Bailhongal | Sugarcane farmer (6 acres) |
| Revanna Siddappa | `9845022226` | `password123` | Tumakuru | Tiptur | Coconut & Arecanut farmer |

---

### 4. 🚜 Additional Equipment Providers

| Name | Phone | Password | District | Village | Primary Equipment Owned |
|------|-------|----------|----------|---------|-------------------------|
| Manjunath H.K. | `9845033334` | `password123` | Mandya | Maddur | Kubota Combine Harvester, Mahindra 575 DI, Water Pump |
| Basavaraj Patil | `9845044445` | `password123` | Dharwad | Hubballi Rural | Power Weeder, Concrete Mixer, Generator |
| Mahadeva Swamy | `9845044446` | `password123` | Mysuru | Nanjangud | John Deere Tractor, Boom Sprayer |
| Kalleshappa Nayak | `9845044447` | `password123` | Davangere | Harihara | Seed Drill, Rotavator |
| Mallikarjun Reddy | `9845044448` | `password123` | Ballari | Siruguppa | Laser Leveler, Multi-Crop Thresher |

---

### 5. 👷 Specialists (Covering All 16 Specializations)

| Name | Phone | Password | District | Specialization | Daily Rate |
|------|-------|----------|----------|----------------|------------|
| Basavaraj M. | `9845055551` | `password123` | Mandya | Harvester Operator | ₹1,200/day |
| Prakash Naik | `9845055552` | `password123` | Belagavi | Agri Drone Pilot | ₹2,500/day |
| Chandru N. | `9845055553` | `password123` | Tumakuru | Pump Mechanic | ₹900/day |
| Kumar Swamy | `9845055554` | `password123` | Hassan | Farm Electrician | ₹900/day |
| Er. Rajesh Murthy | `9845055555` | `password123` | Mysuru | Civil Engineer | ₹2,500/day |
| Dr. Shivaraj Patil | `9845055556` | `password123` | Kalaburagi | Vet Assistant | ₹900/day |
| Siddaramaiah | `9845055557` | `password123` | Vijayapura | Construction Mason | ₹950/day |
| Venkatesh Rao | `9845055558` | `password123` | Bengaluru Rural | Solar Agri Technician | ₹2,200/day |
| Somasekhar | `9845055559` | `password123` | Kolar | Drip Irrigation Plumber | ₹800/day |
| Parashuram | `9845055560` | `password123` | Bagalkot | Implement Welder | ₹850/day |
| Gangadhar | `9845055561` | `password123` | Haveri | Chaff & Silage Tech | ₹800/day |
| Manjula Bai | `9845055562` | `password123` | Chikkamagaluru | Nursery Specialist | ₹900/day |
| Guruswamy | `9845055563` | `password123` | Chamarajanagar | Timber Carpenter | ₹900/day |
| Nagarajappa | `9845055564` | `password123` | Chitradurga | General Labour Lead | ₹650/day |

---

## 🛠️ Admin RBAC Features

1. **KPI Dashboard**: View real-time user breakdown by role (`Seekers`, `Providers`, `Specialists`, `Admins`), verification rate, active/suspended count, and regional distribution across Karnataka.
2. **Instant Role Promotion & Demotion**: Switch any user's role on the fly with automatic RBAC permission adjustment.
3. **Account Suspension & Verification**: 1-click toggle to suspend/reactivate accounts or verify identity badges.
4. **Detailed User Inspection**: View all equipment listed, specialist profiles, active/historical bookings, and requirements posted by any user.
5. **Add User Modal**: Create new verified users directly with custom roles and credentials.
