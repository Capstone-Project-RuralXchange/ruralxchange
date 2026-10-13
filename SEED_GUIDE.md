# RuralXchange sample data

Updated 13 October 2026. The seed is separate from server startup and never runs on deploy.

## Important

This resets **all documents** in the six application collections: users, equipment, specialists, bookings, requirements and ratings. Existing accounts, QA TEST records and booking history in those collections are removed. Other collections, indexes and externally stored Cloudinary assets are not removed. Anyone signed in before a reset should sign out and log in again.

All personas, requests, prices, bookings and reviews are fictional demo data, not actual customers or transactions. The phone identifiers exist only for login demos: do not call, text or send OTPs to them. Coordinates use the application's district-level Karnataka map, not exact equipment/village locations. Existing catalog imagery is illustrative.

No password is stored in this guide or in the seed source. Choose fresh passwords; old published demo passwords are not reused. Shared non-admin demo credentials are suitable for a demonstration database, not a real marketplace. Never expose admin credentials in the login UI.

## Dataset

| Collection | Count | Coverage |
| --- | ---: | --- |
| Users | 31 | 1 admin, 5 seekers, 11 providers, 14 specialists |
| Equipment | 49 | All 24 current categories, 1 maintenance listing |
| Specialist profiles | 14 | Operators, agronomists, electrician, engineer, animal-health worker, pump mechanic, mason, welder, plumber, carpenter, labourer; 1 unavailable profile |
| Bookings | 17 | 2 pending, 4 confirmed, 1 in progress, 8 completed, 2 cancelled |
| Notice requirements | 7 | 3 open, 1 filled, 2 expired, 1 cancelled; community responses |
| Reviews | 10 | 6 equipment, 4 specialist; scores 3-5 |

Dates are relative to the run's India calendar day. Tractor reservations are day +2 to +3, +4 to +5, and +9 to +10. The adjacent blocks do not overlap; +6 to +8 stays free. Equipment-only, specialist-only, compatible bundle and professional-service flows all have examples. One completed seed-drill booking is unrated so the review form can be demonstrated. A cancelled timeout example shows the expiry alert. Pending requests use 24-hour acceptance windows and will expire normally after the reset.

Each booking points at its listing's actual owner. Prices count both start and end days and apply the app's 5% fee. Only active bookings reserve dates. Rating counts/averages, specialist completed jobs and listing earnings are computed from seeded records, not invented totals. All cash-paid flags are fictional history; no payment is processed.

## Demo login identifiers

| Role | Name | Phone login | District |
| --- | --- | --- | --- |
| Admin | Admin Console | `9845000000` | Bengaluru Urban |
| Seeker | Ramesh Gowda | `9845011111` | Mandya |
| Provider | Suresh Patel | `9845022222` | Belagavi |
| Provider | Manjunath H.K. | `9845033334` | Mandya |
| Specialist | Dr. Ananya Rao | `9845033333` | Bengaluru Urban |
| Specialist | Manjunath K | `9845044444` | Mysuru |

Admin also has the legacy email identifier `admin@ruralxchange.in`, but use the phone login supported by the app. The person running the reset supplies the admin password through `SEED_ADMIN_PASSWORD`; non-admin accounts use `SEED_DEMO_PASSWORD`. Each must be at least 12 characters and the two must differ. Transfer credentials privately through a secure password store, not a repository, document or chat.

## Validate without touching a database

```bash
cd backend
npm ci
npm run seed -- --dry-run
```

Dry-run connects to no database and uses temporary random passwords in memory when none are configured. It validates all documents against current schemas and checks bundle compatibility and reservation overlaps.

## Reset a local demonstration database

Use a MongoDB **replica set**, because the reset is transactional. An isolated test replica set is created automatically by `npm test`.

In your protected environment or ignored `backend/.env`, configure:

- `MONGODB_URI`: URI of the intended database, with an explicit database path.
- `SEED_EXPECTED_DB`: that exact database name.
- `SEED_DEMO_PASSWORD`: fresh non-admin demo password.
- `SEED_ADMIN_PASSWORD`: fresh, different admin password.

Then, only after approving deletion:

```bash
npm run seed -- --confirm-reset
```

A bare `npm run seed` refuses to reset. Password validation and dataset schema checks run before the database connection. The six-collection delete/insert runs in one transaction. If insertion or count checks fail, the old data remains. Existing indexes are retained. The seed does not change authentication, dependencies, migrations or startup commands.

## Live Atlas reset: separate approval and access required

Do not assume the local connection URI targets the production database. Verify the exact database name in the deployed backend's `MONGODB_URI`. Obtain explicit wipe approval before execution. Take a snapshot/export first if rollback after a successful commit may be needed. Quiesce traffic during the reset so nobody writes a new record while the old dataset is being replaced.

The executor needs the Atlas URI with database write privileges and network access (allow the executor's exact IP, not unrestricted global access). Supply it through a secure password store or the existing hosting environment, never chat or Git. Supply both new seed passwords and `SEED_EXPECTED_DB` privately too.

For a remote URI, also set this non-secret acknowledgment:

```bash
export SEED_ALLOW_REMOTE=I_UNDERSTAND_DATA_WILL_BE_DELETED
npm run seed -- --confirm-reset
```

Run from `backend/` on the updated feature branch. The connected database name must match `SEED_EXPECTED_DB`, and MongoDB transactions must be supported. Success reports collection counts without printing secrets or the URI. A generic failure message deliberately avoids exposing credentials.

Execution options:

1. Run locally with the protected Atlas connection and IP allowance. This avoids hosting plan changes.
2. Run in an existing paid Render backend shell using its existing database environment and the fresh seed password variables. The backend's working directory normally already contains `package.json`; verify it before running the command.

Render free web services do not provide dashboard/SSH shells or one-off jobs. Do not change the production start command to reseed on boot. Do not add a public reseed route. Do not upgrade hosting or launch a billable one-off job without separate cost approval.

Official references: https://render.com/docs/ssh, https://render.com/docs/free, https://render.com/docs/one-off-jobs

## After a reset

Verify all six counts, log in with a new admin and each demo role, browse equipment/specialists, check the tractor's adjacent blocks/free gap, notice statuses, dashboards and review history. Run one labelled test booking in a free slot, check overlap rejection, then cancel it and verify the slot is released. Keep the seeded demonstration bookings intact. Credentials supplied for a demonstration database should be rotated again before any real-user rollout.

The reset does not erase old credentials from Git history. Revoke/rotate credentials exposed in prior revisions rather than relying on their removal from the latest files.
