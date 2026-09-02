# Architecture Overview

## Tech Stack
- **Backend**: Node.js (v18+), Express, MongoDB (via Mongoose)
- **Frontend**: React (v18), React Router, Context API for state, i18n handling in `src/i18n.js`
- **Build / Tooling**: npm workspaces with scripts defined in the root `package.json`, concurrently for running both servers, ESLint/Prettier (if present), Babel for JSX transpilation.

## Project Layout
```
/ruralxchange
├─ .git/                # Git metadata
├─ .gitignore           # Ignores node_modules, build artifacts, env files
├─ backend/             # Express API server
│   ├─ models/          # Mongoose schemas (User, Equipment, Booking, ...)
│   ├─ routes/          # API route definitions
│   ├─ middleware/      # Auth middleware, etc.
│   ├─ server.js        # Entry point
│   └─ seed.js          # DB seeding script
├─ frontend/            # React SPA
│   ├─ public/          # Static HTML template
│   ├─ src/             # Application source
│   │   ├─ components/  # Reusable UI components (Navbar, Footer, ...)
│   │   ├─ pages/       # Page‑level components (HomePage, EquipmentPage, ...)
│   │   ├─ context/     # React Contexts (AuthContext, …)
│   │   ├─ utils/       # API helper, constants
│   │   └─ i18n.js      # Translation dictionary – **kept at this root level**
│   └─ package.json
├─ node_modules/        # Installed dependencies (both back‑ and front‑end)
├─ package.json         # Root scripts (install:all, dev, seed, build)
└─ README.md            # Project documentation
```

## State Management Rules
- **Authentication**: Managed via `AuthContext` – provides `user`, `login`, `logout` helpers and stores JWT in localStorage.
- **UI Local State**: Individual components use `useState`/`useReducer` for form fields and transient UI state.
- **Shared Data**: When multiple components need the same data (e.g., equipment list), the data is fetched via the `api` utility and stored in component state or lifted to a parent.
- **Routing**: Handled by `react-router-dom`; protected routes check `AuthContext` for a logged‑in user.

## Code Patterns
- **Async/Await** for all server and client API calls.
- **Error Handling**: Centralised error response formatting in Express middleware and `catch` blocks in React.
- **Environment Variables**: `.env` files for both backend (DB connection, JWT secret) and frontend (API base URL) – never committed.
- **i18n**: All translation strings live in a single `src/i18n.js` object, accessed via a helper function throughout the UI.
- **Form Design**: Forms are built with controlled components; validation is done client‑side before API submission.
- **Testing**: (Not yet implemented) – plan to use Jest for backend and React Testing Library for frontend.

---
*This document reflects the current architecture after the initial commit and will be updated as the project evolves.*

> **Audit workflow note**: For future auditors, work from the writable copy located at
> `/Users/arvind/.gemini/antigravity/brain/acf67610-31e8-494d-9d56-e9fc77577ff4/scratch/audit_work`. Follow the steps outlined in `project_state.md` to create audit branches, install dependencies with `--legacy-peer-deps`, and run the dev servers.
