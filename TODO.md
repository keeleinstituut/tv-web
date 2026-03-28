# Calendar Feature — Pending Work

## Blocked on Backend

- **`comments` field in `POST /projects`** — marked "pending BE addition" in backend.md.
  Initial comment on order creation cannot be sent until the backend supports it.
  Frontend already buffers `pendingComment` and attempts to post it after create succeeds
  via `POST /projects/:id/comments`, so this will work once the field is available.

- **Vendor picker broken in order edit mode** — `GET /calendar/slot-matching/vendors` filters
  by availability and excludes the currently assigned vendor (they already have a booking for
  that slot). The dropdown shows available vendors but never the existing one. Two fixes needed:
  1. BE: add an `exclude_project_id` (or similar) param to slot-matching so the current vendor
     isn't excluded when editing their own booking.
  2. FE: `ProjectResource` has no embedded vendor/assignment data, so `CalendarOrderDetail`
     can't pre-populate `vendorId`. Once BE exposes vendor info on `GET /projects/:id`, map it
     in `transformProjectDetail` and seed `vendorId` in the `useEffect`.

- **External translator cascade** — `use_external_vendor: bool` exists in `PUT /projects/:id`
  body but the full cascade algorithm (Algorithm 3) is a backend concern. On the FE side,
  a "Lepinguline tõlk/Väline tõlk" option needs to be added to the Teostaja dropdown in both
  the side panel and order detail view to trigger it.

## Frontend Work Remaining

- **EMO scheduling UI** — TPM assigns EMO shifts via "Teostajate andmebaas" (vendor profile
  page). The API (`POST/DELETE /vendors/:id/emergency-schedules`) is ready. A date-picker
  calendar section needs to be added to the vendor profile page. EMO vendor rows in the
  calendar day view already render in yellow once `emergency_schedules` is populated.

- **Rating widget ("Hinnang tõlkekorraldusele")** — needs backend schema first, then FE
  implementation. Appears in the order detail view.

- **Reaction time setting** — configurable per institution under "Asutuse Sätted". Should be
  a numeric input (minutes, default 30) with an info tooltip explaining the cascade behaviour.

- **Calendar import UI** — "Kalendri Sätted" section on the Teostaja profile page.
  "Impordi failist" button that POSTs `.ics` file to `POST /calendar/import`
  (multipart: `file` + `import_end_date`). An expiry reminder email is sent by the backend
  2 working days before the imported calendar expires.

- **Comment edit/delete** — the API supports `PUT` and `DELETE /projects/:project/comments/:comment`
  (author only). The edit pencil is wired in the order detail view UI but the actual `PUT`
  call is not hooked up yet (clicking Save in edit mode currently does nothing).
