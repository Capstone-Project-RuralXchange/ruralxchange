# 🌾 RuralXchange — Rural Service & Equipment Marketplace

> **Capstone Project AY 2025-26** — B.M.S. College of Engineering, Dept. of ISE  
> Connects Karnataka's rural seekers, equipment providers, and skilled specialists through a unified digital marketplace.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Seeding Sample Data](#seeding-sample-data)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Design System](#design-system)

---

## Project Overview

RuralXchange solves the fragmented rural equipment rental and labour hiring market in Karnataka by providing:

- **Seekers** — Farmers and households who need equipment or skilled workers
- **Providers** — Equipment owners who rent out idle machinery
- **Specialists** — Skilled workers (tractor operators, irrigation technicians, vets, electricians, etc.)

### Core Innovation: Bundle Booking
One transaction confirms both equipment AND a specialist operator together — eliminating coordination overhead.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Framer Motion, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| File Upload | Multer + Cloudinary |
| Styling | Custom CSS Design System (earthy palette) |

---

## Features

- ✅ Phone-number based registration & login
- ✅ Role-based access: Seeker / Provider / Specialist / Admin
- ✅ Equipment listings with 15 categories
- ✅ Specialist profiles with tier system (Professional / Skilled / Labour)
- ✅ **Bundle Booking** — equipment + operator in one booking
- ✅ Public Requirement Board (notice board)
- ✅ Dual rating system for equipment and specialists
- ✅ Seasonal demand calendar (12-month Karnataka agri calendar)
- ✅ Provider earnings dashboard
- ✅ District-based filtering (30 Karnataka districts)
- ✅ Kannada / Hindi / English language preference

---

## Prerequisites

- **Node.js** v18+ and npm v9+
- **MongoDB** — either local (`mongod`) or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Cloudinary** account (free) for image uploads — or skip for now (images are optional)

---

## Setup & Installation

### 1. Clone / Download the project

```bash
# If using git
git clone <repo-url>
cd ruralxchange

# Or just navigate to the project folder
cd ruralxchange
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

```bash
cp .env.example .env
# Now edit .env with your values (see Environment Variables section)
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB — choose one:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/ruralxchange
# MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ruralxchange

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Cloudinary (optional — only needed for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Running the Project

### Option A: Two terminals (recommended for development)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # uses nodemon for auto-reload
# OR
node server.js     # without auto-reload
```
Backend runs at: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
Frontend runs at: http://localhost:3000

### Option B: Run both with one command (root)

```bash
# From project root
npm install        # installs concurrently
npm run dev        # starts both backend and frontend
```

---

## Seeding Sample Data

Populate the database with realistic test data:

```bash
cd backend
node seed.js
```

This creates:

| Role | Phone | Password |
|------|-------|----------|
| Seeker | 9000000001 | pass123 |
| Provider | 9000000002 | pass123 |
| Specialist | 9000000003 | pass123 |
| Admin | 9000000000 | pass123 |

Also seeds 8 equipment listings and 5 specialist profiles across Karnataka districts.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with phone + password |
| GET | `/api/auth/me` | Get current user (auth required) |
| PUT | `/api/auth/updateprofile` | Update profile (auth required) |

### Equipment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment` | List all equipment (filterable) |
| GET | `/api/equipment/:id` | Get single equipment |
| POST | `/api/equipment` | Create listing (provider only) |
| PUT | `/api/equipment/:id` | Update listing (owner only) |
| DELETE | `/api/equipment/:id` | Delete listing (owner only) |
| GET | `/api/equipment/owner/listings` | Get my listings |

### Specialists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/specialists` | List all specialists |
| GET | `/api/specialists/:id` | Get specialist profile |
| POST | `/api/specialists` | Create profile (specialist only) |
| GET | `/api/specialists/me/profile` | Get my profile |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | Get seeker's bookings |
| GET | `/api/bookings/provider` | Get provider's bookings |
| PUT | `/api/bookings/:id/status` | Update booking status |

### Requirements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requirements` | Public notice board |
| POST | `/api/requirements` | Post requirement (auth) |
| POST | `/api/requirements/:id/respond` | Respond to requirement (auth) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seasonal/all` | Full 12-month agri calendar |
| GET | `/api/seasonal/current` | Current month demand data |
| GET | `/api/users/dashboard` | Dashboard stats (auth) |
| POST | `/api/ratings` | Submit rating (auth) |

---

## Project Structure

```
ruralxchange/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Equipment.js
│   │   ├── Specialist.js
│   │   ├── Booking.js
│   │   ├── Requirement.js
│   │   └── Rating.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── equipment.js
│   │   ├── specialists.js
│   │   ├── bookings.js
│   │   ├── requirements.js
│   │   ├── ratings.js
│   │   ├── seasonal.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   └── layout/
        │       ├── Navbar.js
        │       └── Footer.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── HomePage.js
        │   ├── EquipmentPage.js
        │   ├── EquipmentDetailPage.js
        │   ├── SpecialistsPage.js
        │   ├── SpecialistDetailPage.js
        │   ├── BookingPage.js
        │   ├── RequirementsPage.js
        │   ├── DashboardPage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── ListEquipmentPage.js
        │   ├── BecomeSpecialistPage.js
        │   ├── SeasonalPage.js
        │   └── ProfilePage.js
        ├── utils/
        │   ├── api.js
        │   └── constants.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## Design System

The frontend uses an earthy, rural-inspired palette defined as CSS variables:

| Variable | Value | Usage |
|----------|-------|-------|
| `--soil` | `#2D1B0E` | Primary text, headings |
| `--terracotta` | `#C1440E` | Primary actions, CTAs |
| `--harvest` | `#E8A020` | Accent, highlights |
| `--leaf` | `#2D6A2D` | Success, specialist tier |
| `--cream` | `#FDF6E3` | Page background |
| `--clay` | `#6B4226` | Secondary text |
| `--sand` | `#E8D5B0` | Borders, dividers |

Font: **Sora** (Google Fonts) — modern, legible at small sizes for rural users.

---

## Notes for Evaluators

- The app is fully functional end-to-end with a real MongoDB backend
- Run `node seed.js` first to get sample data, then use the demo credentials above
- Bundle Booking is the key differentiating feature — try booking equipment with type `bundle`
- The seasonal calendar (/seasonal) shows 12-month Karnataka agricultural demand data
- All forms use dropdowns where possible to support semi-literate users (as per project requirements)

---

*Made with ❤️ for Karnataka's farming community | B.M.S. College of Engineering, ISE Dept., 2025-26*
