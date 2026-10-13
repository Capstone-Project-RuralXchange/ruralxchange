# Full-flow QA fixes, 13 October 2026

Base: 6bcc4a6. Branch: feature/accurate-road-distance. Main untouched.

- Reservation dates parsed as local day labels; first booked day disabled, end-date range stops before next reservation, inclusive overlap checked on submit. Bundle checks include both resources. Conflict toast localized.
- Equipment detail uses a responsive single-column layout on phones; booking card stays in the normal flow.
- Notice creation whitelists editable fields. Server controls owner, status, responses, expiry, views and coordinates. District must match the Karnataka district list.
- Notice response requires a trimmed 1-2000-character message. Price, when supplied, must be finite and between 0 and 1,000,000,000. One response per user per notice, enforced atomically.
- Auth rejects non-text identifiers/passwords before database queries; registration trims phone and returns field validation messages. Malformed JSON returns a generic 400.
- Specialist onboarding preserves provider/admin role. Seeker onboarding still changes seeker to specialist so existing specialist dashboard flow works.
- Resource path IDs validated. Query values must be scalar text, without NUL. Page/limit positive integers; limit capped at 100. Numeric prices/coordinates validated. No database query operator objects accepted through query parameters.
- Equipment-only bookings omit specialist state; specialist-only bookings omit equipment state. No bulk changes to old records.
- Dashboard separates bookings made from bookings received and uses server all-time counts rather than the recent list length.
- Avatar URLs restricted to HTTP(S). React's existing escaped-text rendering unchanged.
- Rating running average keeps precision; existing displays still round to one decimal. Historical rounded averages aren't rewritten.
- Register errors are scrolled into view and focusable. Step/route navigation resets scroll. Password sizing/eye icon contained.
- Missing role/status/completed-work translations filled; response-window text no longer includes English in Kannada; date/window controls sized correctly; unknown day count displays 0 rather than a question mark.
- Removed placeholder footer phone, replaced village example with Mandya, dashboard greeting is now Welcome.
- Public owner phone left unchanged pending user's decision.

## Checks
Backend: 37 passing tests plus routing/schema checks. Frontend: 16 passing tests; production build passes. Regression tests run on isolated in-memory MongoDB, not the live database.
No dependency, auth mechanism, index, migration or environment changes. Existing QA accounts remain, no secrets included.
