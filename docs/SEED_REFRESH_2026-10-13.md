# Seed refresh, 13 October 2026

Branch: feature/accurate-road-distance. Main unchanged.

- Extracted the existing Karnataka catalog to backend/seed/catalog.json; removed hard-coded passwords and personal avatar photos.
- Replaced the old immediate destructive seed with explicit reset and exact database-name checks, remote acknowledgment, schema validation and a six-collection transaction.
- Demo/admin credentials come from separate environment variables, minimum 12 characters. No password logging or repository credentials.
- Rebuilt booking scenarios with correct owners, compatible bundles, inclusive-day pricing, participant state only for present resources and linked active reservation ranges.
- Ratings, earnings and completed jobs match the actual seeded history. No fictional review count inflation or incremental rounding.
- Notice status/expiry and responses reflect current app rules.
- Updated SEED_GUIDE.md with current counts, login identifiers, execution/access requirements and no secret values.
- No auth, dependency, server startup or deployment configuration changes. Publishing this commit does not reset the live database.

Checks: 42 backend tests plus routing/schema checks; 16 frontend tests; production frontend build. New seed tests cover dry prerequisites, schema/reference/price/ratings consistency, repeat reset, role logins, transactional rollback and booked/free date behavior. All checks use isolated MongoDB, not the live database.

Live reset is a separate step requiring wipe approval, current database access, exact target confirmation and fresh admin/demo passwords. Do not run it just because this commit deployed.
