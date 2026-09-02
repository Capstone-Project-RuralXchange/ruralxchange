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
- **Seeker / Provider / Specialist Accounts**: `pass123`
- **Admin Accounts**: `admin123`

---

### 1. 👑 Admin Accounts (RBAC User Management)

| Name | Phone | Password | Role | District / Note |
|------|-------|----------|------|-----------------|
| **Super Admin** | `9000000000` | `admin123` | `admin` | Bengaluru Urban (Full Console) |
| **Karnataka Regional Admin** | `9000000001` | `admin123` | `admin` | Mysuru (Southern Zone Operations) |

> 💡 **Admin Console Access**: Log in with either admin account to see the **"👑 Admin RBAC"** link in the navigation bar or access [`http://localhost:3000/admin/users`](http://localhost:3000/admin/users).

---

### 2. 🔍 Seekers (Farmers & Hirers — 10 Users)

| Name | Phone | Password | District | Village | Speciality / Bio |
|------|-------|----------|----------|---------|------------------|
| Krishnamurthy B. | `9100000001` | `pass123` | Mandya | Maddur | Sugarcane & Paddy (12 acres) |
| Savitha Naik | `9100000002` | `pass123` | Tumakuru | Sira | Groundnut & Ragi farmer |
| Prakash Gowda | `9100000003` | `pass123` | Hassan | Alur | Coffee & Cardamom planter |
| Anitha Reddy | `9100000004` | `pass123` | Kolar | Bangarpet | Greenhouse Tomato & Capsicum |
| Basavaraj Patil | `9100000005` | `pass123` | Belagavi | Gokak | Sugarcane grower |
| Mallikarjun Hiremath | `9100000006` | `pass123` | Kalaburagi | Sedam | Red Gram (Tur Dal) cultivator |
| Suma Prabhakar | `9100000007` | `pass123` | Mysuru | Hunsur | Tobacco & Ginger farmer |
| Devendrappa Nayak | `9100000008` | `pass123` | Davangere | Harihar | Maize & Cotton grower |
| Gangadhar Biradar | `9100000009` | `pass123` | Bagalkot | Mudhol | Pomegranate & Jowar farmer |
| Manjunath Shettigar | `9100000010` | `pass123` | Shivamogga | Sagar | Arecanut & Vanilla plantation |

---

### 3. 🚜 Providers (Equipment Fleet Owners — 10 Users)

| Name | Phone | Password | District | Village | Primary Equipment Owned |
|------|-------|----------|----------|---------|-------------------------|
| Ramu Gowda | `9200000001` | `pass123` | Mandya | Kirugavalu | Mahindra 575 DI, John Deere, Shaktiman Rotavators |
| Manjula Devi | `9200000002` | `pass123` | Hassan | Sakleshpur | Kubota Combine Harvesters, Kirloskar Power Tillers |
| Suresh Nagaraj | `9200000003` | `pass123` | Mysuru | Nanjangud | Kirloskar 15 kVA Silent DG Set, CRI Submersible Pumps |
| Venkatesh Rao | `9200000004` | `pass123` | Davangere | Honnali | Diesel Concrete Mixers, Bosch Demolition Drills |
| Chandrasekhar Kulkarni | `9200000005` | `pass123` | Dharwad | Navalgund | Aspee Battery Sprayers, National Threshers, VST Tillers |
| Hemanth Kumar | `9200000006` | `pass123` | Chitradurga | Hiriyur | Diesel Pump Sets, Agrimate 52cc Earth Augers |
| Santosh Badiger | `9200000007` | `pass123` | Vijayapura | Indi | ESAB 300A Inverter Welders, Honda Portable DG sets |
| Ramesh Reddy | `9200000008` | `pass123` | Ballari | Siruguppa | Preet 987 Multi-Crop Combine Harvester |
| Gopalakrishna Bhat | `9200000009` | `pass123` | Dakshina Kannada | Puttur | Ahuja 2000W Sound System, Shamiana Tents, LED Masts |
| Mahantesh Kadadi | `9200000010` | `pass123` | Koppal | Gangavathi | Fieldking 7-ft Rotavators, Mitra 600L Boom Sprayers |

---

### 4. 👷 Specialists (Covering All 16 Specializations — 16 Users)

| Name | Phone | Password | District | Specialization | Daily Rate |
|------|-------|----------|----------|----------------|------------|
| Shiva Kumar | `9300000001` | `pass123` | Mysuru | Tractor Driver / Laser Leveller | ₹850/day |
| Raju Harvester | `9300000002` | `pass123` | Mandya | Combine Harvester Operator | ₹1,200/day |
| Vijay Electrician | `9300000003` | `pass123` | Bengaluru Rural | Licensed Farm Electrician | ₹900/day |
| Basavanna Mason | `9300000004` | `pass123` | Dharwad | Rural Construction Mason | ₹950/day |
| Naveen Plumber | `9300000005` | `pass123` | Tumakuru | Drip Irrigation Plumber | ₹800/day |
| Chandru Pump Mech | `9300000006` | `pass123` | Hassan | Borewell Pump Technician | ₹900/day |
| Santosh Welder | `9300000007` | `pass123` | Belagavi | Mobile Implement Welder | ₹850/day |
| Ganesh Carpenter | `9300000008` | `pass123` | Shivamogga | Timber Craftsman | ₹900/day |
| Manjunath Painter | `9300000009` | `pass123` | Kolar | Farmhouse Painter | ₹750/day |
| Hanumantha Labourer | `9300000010` | `pass123` | Raichur | Agricultural Labour Team Lead | ₹650/day |
| Dr. Srinivas Agronomist | `9300000011` | `pass123` | Bengaluru Urban | Crop Health & IPM Agronomist | ₹2,000/day |
| Er. Rajesh Civil | `9300000012` | `pass123` | Udupi | Farm Pond & Civil Engineer | ₹2,500/day |
| Er. Preethi Electrical | `9300000013` | `pass123` | Mysuru | Solar Agri Microgrid Engineer | ₹2,200/day |
| Dr. Anand Vet | `9300000014` | `pass123` | Ballari | Livestock Healthcare Assistant | ₹900/day |
| Karthik Fridge Tech | `9300000015` | `pass123` | Chikkamagaluru | Milk Cooler & RAC Tech | ₹1,100/day |
| Subhash Drone Tech | `9300000016` | `pass123` | Bagalkot | DGCA Agri Drone Pilot | ₹2,500/day |

---

## 🛠️ Admin RBAC Features

1. **KPI Dashboard**: View real-time user breakdown by role (`Seekers`, `Providers`, `Specialists`, `Admins`), verification rate, active/suspended count, and regional distribution across Karnataka.
2. **Instant Role Promotion & Demotion**: Switch any user's role on the fly with automatic RBAC permission adjustment.
3. **Account Suspension & Verification**: 1-click toggle to suspend/reactivate accounts or verify identity badges.
4. **Detailed User Inspection**: View all equipment listed, specialist profiles, active/historical bookings, and requirements posted by any user.
5. **Add User Modal**: Create new verified users directly with custom roles and credentials.
