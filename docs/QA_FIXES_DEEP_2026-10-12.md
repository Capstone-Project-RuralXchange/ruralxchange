# Deep QA fixes (findings 2-9), 12 October 2026

Branch: feature/accurate-road-distance. Main is untouched. Source fixes only; nothing here claims production was updated or retested.
Finding numbers match the RuralXchange deep QA report of 2026-10-12.

## Deploy and config steps (read first)

- **No new environment variables.** CLIENT_URL, TRUST_PROXY_HOPS, MONGODB_URI, JWT_SECRET and everything else stay as they are.
- **One new unique index** on the `ratings` collection: `{ booking, ratedBy, ratingType }`. Mongoose builds it on backend start (autoIndex). **If production already holds duplicate ratings for the same booking, user and type, the index build fails** (error is logged, the server keeps running, but atomic uniqueness is then NOT enforced). Before deploying, run in MongoDB: `db.ratings.aggregate([{$group:{_id:{b:"$booking",u:"$ratedBy",t:"$ratingType"},n:{$sum:1}}},{$match:{n:{$gt:1}}}])`. Remove or merge any duplicates it returns, then deploy.
- No data migration. Existing specialists simply have no bio until they add one. Existing rating data is not modified.
- Existing booking and notice records need nothing. Notices with no `expiresAt` are treated as not expired.
- Frontend needs a normal rebuild (`npm run build`). No new dependencies.
- Back up MongoDB as usual before any deploy.

## Findings

2. **Rating target authorization (HIGH).** POST /api/ratings now requires the rating type to be 'equipment' or 'specialist', the target to be the booking's own equipment (or specialist), the caller to be the booking's seeker, and the booking to be completed. A mismatch returns 403 and changes nothing. Score must be a whole number 1-5. Duplicates are blocked by the unique index above (concurrent duplicate gets 409). Average and count are updated in one atomic database update, not read-then-write.
3. **Impossible dates.** `businessDate` accepts only ISO `YYYY-MM-DD` or ISO date-time with `Z`/offset (or a Date object). Calendar components are checked before parsing: `2027-02-30`, `2027-13-01`, `10/20/2026`, `2026-1-5` and similar are rejected with 400. Date-only values are used as the India calendar day directly. Instants still go through India-day normalization. Year range 2020-2100 unchanged.
4. **Expired notices.** Responses are accepted only when the notice is open, not expired, and not the responder's own. Atomic single update. Cancelled/filled/expired/past-expiry returns 409, own post 403, missing 404. Offered price must be a finite number >= 0; a price of 0 is now saved (it used to be dropped). The open listing excludes expired notices.
5. **Mobile navbar.** Signed-out Sign In and Join Free move into the mobile menu below 560px, tagline and signed-in name are hidden on small screens, language label collapses at 360px and below. Checked in headless Chrome at 320px and 390px, signed out and signed in: navbar width equals the viewport and the hamburger is fully visible (screenshots inspected).
6. **Fake empty states.** Equipment, Specialists and Notice Board pages now show a distinct error state with a Retry button when the API fails, a skeleton while loading, and "No ... found" only for a real empty response. A failed Load More shows an inline retry.
7. **Specialist bio.** `bio` added to the specialist model (trimmed, max 500 characters; longer returns 400) and to the registration whitelist. Edit already allowed it.
8. **Booked filter.** Removed from the specialist browse page. The backend still accepts a `status` query for old links.
9. **Rental bounds.** Min and max rental days are normalized to numbers before comparison. Fractions, NaN, Infinity, empty, zero and negatives return 400. One-sided edits are compared against the stored value.

## Tests

Backend: 13 existing plus 10 new in `backend/test/deeper-fixes.test.js` (the QA repro file, flipped to assert correct behavior and extended). Routing 5 and schema 10 unchanged. Frontend: 7 existing plus 7 new (`frontend/src/deeperFixes.test.js`). `CI=true npm run build` compiles with no warnings.
