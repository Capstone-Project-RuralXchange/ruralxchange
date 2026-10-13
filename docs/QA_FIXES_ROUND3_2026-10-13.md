# QA Fixes - Round 3 (2026-10-13)

Live-site QA round 3 found 5 functional bugs (all MEDIUM). Fixes below; no behavioural changes beyond these.

## 1. Specialist skill-level filters did nothing
- **Cause:** `backend/routes/specialists.js` never read the `tier` query param the Specialists page sends.
- **Fix:** map `tier` (professional / skilled / labour) to its specializations (mirroring frontend `SPECIALIST_TYPES`) and filter `specialization: { $in: [...] }`, on both the standard and geo-sorted paths. An explicit `specialization` param still wins.

## 2. Specialist keyword API search returned 500
- **Cause:** `$regex` was applied to `qualifications` (an array of objects), which MongoDB cannot match.
- **Fix:** search the nested string fields `qualifications.degree` and `qualifications.institution` instead.

## 3. Punctuation broke equipment search (500)
- **Cause:** raw user input was passed straight into `$regex`, so metacharacters like `[` crashed the query.
- **Fix:** escape user input (`escapeRegex`) before building the regex, in both equipment and specialist search.

## 4. Equipment model searches missed real listings
- **Cause:** search queried top-level `brand` / `model`, but listings store them under `specifications.brand` / `specifications.model`.
- **Fix:** query `specifications.brand` and `specifications.model`.

## 5. Homepage search always routed to equipment
- **Cause:** `HomePage.handleSearch` always navigated to `/equipment`, so specialist searches (e.g. "electrician") showed nothing.
- **Fix:** if the term matches a specialist type (and no equipment category), navigate to `/specialists?specialization=<type>`. Equipment categories keep priority, so "tractor" still searches equipment.

## Tests
- New regression tests: `backend/test/round3-search.test.js` (6 tests: tier filter standard + geo paths, keyword search, regex-metacharacter literals, specifications brand/model).
- Full backend suite: 29/29 passing. Frontend production build: clean.
