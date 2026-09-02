# Project State Overview

## Completed Features
- **Backend API** (Node/Express):
  - User authentication (login/register) with JWT.
  - CRUD endpoints for Equipment, Booking, Rating, Requirement, Specialist, and Seasonal data.
  - Seed script (`backend/seed.js`) that populates the database with sample data.
  - Middleware for auth protection.
- **Frontend SPA** (React):
  - Routing for all main pages (Home, Equipment, Equipment Detail, Booking, Dashboard, Requirements, Seasonal, Specialists, Profile, Login, Register, etc.).
  - Context‑based authentication (`src/context/AuthContext.js`).
  - i18n translation dictionary located at `src/i18n.js` (kept as a single file as per requirements).
  - Forms for posting requirements and adding equipment (UI redesign approved).
  - API utility (`src/utils/api.js`) that abstracts calls to the backend.
  - Basic UI components (Navbar, Footer, layout wrappers).
- **Project Setup**
  - Root `package.json` with scripts for installing both back‑ and front‑end, concurrent development, seeding, and building the frontend.
  - `.gitignore` added to exclude `node_modules/`, environment files, build artifacts, etc.

## Pending Capstone Tasks
- **Form Redesign Implementation**: Apply the approved UI redesigns to `RequirementsPage.js` and `AddEquipment` form components.
- **Testing**:
  - Add Jest unit tests for backend models and routes.
  - Add React Testing Library tests for key frontend components/pages.
- **Deployment**:
  - Configure CI/CD (GitHub Actions) for linting, testing, and deployment to a hosting platform.
- **Performance & Accessibility**:
  - Optimize lazy loading of heavy components.
  - Run accessibility audits (e.g., axe) and address any issues.
- **Documentation**:
  - Expand README with contribution guidelines, API spec, and deployment instructions.

## Standard Commands
```bash
# Install dependencies for both back‑ and front‑end
npm run install:all

# Run development servers concurrently (backend on 5000, frontend on 3000)
npm run dev

# Run only backend server
npm run dev:backend

# Run only frontend React app
npm run dev:frontend

# Seed the database (make sure MongoDB is running)
npm run seed

# Build the React frontend for production
npm run build
```

## How to Run Tests (when added)
```bash
# Backend tests (Jest)
npm test --prefix backend

# Frontend tests (React Testing Library)
npm test --prefix frontend
```

## Current Audit Work (2026-08-21)

- **Issue**: Permission errors prevent the dev servers from starting in the original `Downloads/ruralxchange` location.
- **Solution**: Use a writable copy of the repository located in the agent’s scratch area (`scratch/audit_work`). This copy excludes the `.git` folder and avoids the restrictive ACLs on `~/Downloads`.

- **Next steps**:
  1. Change to the scratch copy:
     ```bash
     cd /Users/arvind/.gemini/antigravity/brain/acf67610-31e8-494d-9d56-e9fc77577ff4/scratch/audit_work
     ```
  2. Create temporary audit branches (e.g., `git checkout -b audit/frontend` and `git checkout -b audit/backend`).
  3. Install dependencies with legacy peer deps:
     ```bash
     npm install --legacy-peer-deps --prefix frontend
     npm install --legacy-peer-deps --prefix backend
     ```
  4. Start the dev servers as daemons:
     ```bash
     npm start --prefix frontend   # http://localhost:3000
     npm start --prefix backend    # http://localhost:5000
     ```
  5. Revive the frontend, backend, and test‑runner sub‑agents, pointing them at the `audit_work` path.
  6. After all tests pass, commit the verified changes and push the audit branches back to the remote.

- *Future auditors should continue from the `scratch/audit_work` directory.*
