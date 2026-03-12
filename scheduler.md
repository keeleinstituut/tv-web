# Scheduler Feature

## Business Logic (FE -> this is what we need to do here)

## Main flows

### From displaying the default calendar to placing an order

1.  User clicks on Kalender from the main navigation menu and lands on the calendar component.
2.  By default the calendar is being displayed
    1. depending on the role for
       1. Client
          1. rows for booking a spoken interpretor (Translator) are being displayed for the languages
             1. enabled from organisation settings as a main language or
             2. not enabled (harvikkeeled) for which current Client has any orders within the timeframe and
       2. Translator
          1. rows with
             1. orders assigned to the user corresponding to languages are being displayed and if the user has a blocked time in the calendar then this is displayed across the language rows orsti
             2. if the user has no assigned bookings then just one row with blocked times or empty and the row label is /forall
       3. TPM
          1. all rows are displayed as described in the next flow description.
    2. Täna (today) is selected as the timeframe and
    3. slots start and end time are based on the default working times in organisation settings (Tööajad) and
    4. the marker right on top of the calendar slots indicates current time.
3.  Order booking slots are displayed color coded and standing for
    1.  plain grey
        1. unused and unbookable past slots and
        2. unbookable future slots if
           1. none of the Translators for the language have imported their personal calendars for the date and
           2. the language is
    2.  grey with time indication icon - past slots with Client's booking
    3.  light blue with time indication icon - current and upcoming Client's bookings
    4.  dark blue with label "+ Vali aeg" - bookable slots
    5.  red with a label "Hõivatud" - fully booked slots
4.  Actions for adding an order are available to TPM and Client through
    1.  clicking on an available slot
    2.  clicking and dragging a slot with the preferred length (in 0.5h min increments)
    3.  clicking on "Veel" on the toolbar and selecting "Lisa tellimus" from the sub menu.
5.  If the order is placed through
    1.  clicking on the available slot or by using the click & drag then the sidepanel is opened to add an order or
    2.  if the oder is placed through "Veel" sub menu "Lisa tellimus", then the user is taken to the order detail view.

---

### Calendar & Toolbar actions and fast time slot search

1. Calendar component is displayed to the user.
2. From the toolbar, user can choose if the timeframe being displayed as
   1. day or
   2. week ([visual example](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=705-31160&m=dev&t=44I4yKkXDRF92cBY-1)) or
   3. month ([visual example](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=705-49080&m=dev&t=44I4yKkXDRF92cBY-1)) and
      1. in this case also the calculated sum of accepted orders is being displayed.
3. User can use the arrows on top of the calendar in order to navigate to previous/next period.
4. Displaying the rows in the calendar depend on the role of the user. If the user is:
   1. Translator, then only the rows corresponding to languages (ISO639 2-digit code) for which I have assigned orders, are being displayed;
   2. ==Client==, then
      1. all of the rows corresponding to main languages are being displayed **in a summarizing manner** meaning that slots correspond to overall availability of translators in a particular time slot but they are e not personalised and
      2. user can pin/unpin favourite languages to the calendar;
   3. TPM or has the privilege of a TPM as a Client, then
      1. pinned language rows are **extended** where every sub-row corresponds to every Translator for the language that the organisation has and
      2. all the other rows corresponding to the rest of the main languages are being displayed **in a summarizing manner (as collapsed, in this context)** meaning that slots correspond to overall availability of translators (initials to mark the row + tooltip on hover) in a particular time slot but they are e not personalised and
      3. user can pin/unpin favourite languages to the calendar;
      4. user can collapse/extend all of the rows.
5. Fast search/filtering is enabled for Client and TPM to
   1. filter by 1. language 2. timeframe 3. slot length.
   2. Upon selecting tehe parameters and clicking button "Leia sobiv aeg"
      1. corresponding rows are being displayed and
      2. if the user is TPM the sub rows displayed for the language are extended.

---

### Adding an order through side panel

1. If the order is placed through the side panel the following data is assigned to the order
   1. order number ("Tellimuse number") as a sequence code
   2. client ("Tellija") as the one placing the order or selected from dropdown if the order was added by TPM
   3. language which corresponds to the row from where the side panel was opened
   4. date and time of the start of the order
   5. duration of the order
   6. translator which may or not be displayed to the user depending on the privilege and
2. the time slot chosen is **prebooked** for the order.
3. User can also fill in the following fields
   1. "Tellija" which is input suggest field of the Clients' and is displayed if the user has a privilege of a TPM
   2. "viitenumber" a text input which can be used as an organisation specific identifier within the organisation
   3. "teenuse tüüp" a dropdown for order type with options
      1. "Kaugtõlge" - remote spoken interpretation and
      2. "Kontakttõlge" - on-site spoken interpretation
   4. "Valdkond" - a dropdown where user can select label's connected to Translator
   5. "Teostaja" a dropdown with available Translators for the chosen time slot and if the user has a correct privilege
   6. A text field called
      1. "Asukoht" if the type is "kontakttõlge" or
      2. "Koosoleku link" if the type is "kaugtõlge".
4. Side panel also has the following sections:
   1. "Lisamaterjalid" for adding/removing and downloading attachments where user can
      1. add, remove and download attachments as TPM
      2. add, remove and download attachments as Client if the order was added by the same Client
      3. download attachments as a Translator if the current order is assigned to the same Translator.
5. "Kommentaarid" as a blob for adding comments by all roles and
   1. comment will be added below the text input area and
   2. every comment will have a timestamp next to it and
      1. if the user is Client or Translator the names of the roles are displayed or
      2. if the user is TPM then the actual names of the users are displayed.
6. Clicking on the main action button "Loo tellimus"
   1. the order is created and
   2. notification is sent to the prebooked Translator for acceptance.
7. Clicking on "Ava" opens the order detail view with all the filled in data.
8. Clicking on secondary action button "Katkesta" and "Sulge X"
   1. closes the side panel and
   2. voids the prebooking.

---

### Adding an order through order detail view

**Note!** This way of adding an order can be used to add orders for any language. This also menas that this is the only way to add orders for languages that are NOT marked as main languages and are therefore not displayed in the main calendar component as rows.

1. User clicks on
   1. "Veel" -> "Lisa tellimus" on the toolbar or
   2. opens the detail view from the side panel "Ava" to open the detail view.
2. All the fields are displayed using the same logic as for the side panel.
3. Timeframe of the order can be chosen using the "kuupäev ja kellaaeg" and "kestus" and
   if the language chosen is main language then after selecting a longer duration then notification is shown to user that chosen time slot is booked and therefore the order is treated separately or
   if the language is not main language (harvikkeel), then any time and date (following the overall rule of not adding orders to the same day) are allowed.
4. User can void the pre order by clicking on secondary button "Katkesta" and
   1. the detail view is closed and
   2. the pre booking is voided.
5. User can click on primary action button "Loo tellimus" in order to create the order and
   1. if the language of the the order is a main language then the order will be assigned to the Translator nad the Translator will get a notification or
   2. if the language is NOT a main language then the order is assigned to TPM and the TPM will get a notification.

---

### Accepting & declining an order

1. User clicks on the link in the notification they got via email and
   1. the calendar view opens with the order time slot visible in the center of the given time slot and
   2. with the side panel opened that has the details of the order visible
      1. uneditable if the user has the prvilege of a Translator or
      2. editable if the user has tan he privilege of a TPM.
2. On top of the panel buttons are displayed:
   1. secondary action button "Lükka tagasi" and
   2. primary action button "Võta vastu".
3. Clicking on "Lükka tagasi" will
   1. decline the order by the Translator and
   2. will start the algorithm of finding an available Translator but **excludes** the current chosen Translator and
   3. the new Translator will be assigned and will get a notification.
4. Clicking on "Võta vastu" will
   1. accept the order by Translator and
   2. the Translator will
      1. gain access to the attachments and
      2. see the Client data and
   3. the Client will get a notification that the order was accepted.

---

### Changing/editing and voiding an order

1. User opens an existing order in a side panel or detail view.
2. If the user is TPM or the Client for this order, then buttons
   1. "Muuda" - for changing the order and
   2. "Tühista" - for voiding the order are displayed.
3. When user clicks on "Muuda" then
   1. the input fields are editable using the same rules as it was a new order and
   2. button "Salvesta" is displayed to save the changes and
   3. button "Tühista muudatused" is displayed to cancel the editing and
      1. when user clicks on "Tühista muudatused" all of the changes made are canceled and the order returned to uneditable state.
      2. When user clicks on "Salvesta" then
         1. system checks if there are changes made to the previous data and
            1. if there are no discrepancies from the existing data then the order will resume to the uneditable state or
            2. if there are changes then these will be saved and if
               1. time, duration and/or translator was changed, then notification will be sent out:
                  1. to new Translator for the order being assigned for acceptance and
                  2. to previous translator for the order being unassigned and
                  3. to the Client for the changes made.
4. When user clicks on button "Tühista" then
   1. the system throws a double confirmation and
      1. if the confirmation is negative then returns to editable state or
      2. if the confirmation is positive then
         1. voids the order and
         2. sends a notification about voiding to
            1. the Client and
            2. the Translator and
            3. if the order had no Translator assigned (it was created for harvikkeel but not yet assigned to a translator by the TPM), then to this TPM.

## Managing EMO translators

Summary: In case all the available time slots are full, client must be still able to book an order. All such orders will appear in regular orders (Tellimused) list and respective notification is also sent to TPM once the order is created. TPM must manually find a translators/Vendor from the available vendors/translators list. In such list, there are regular vendors/translators and also so called EMO vendors/translators. TPM can assign manually EMO vendors to take care of the order.

TPM is responsible of booking Vendors/translators to EMO shift. Once the Vendor is on EMO shift, the system does not assign any orders to them automatically, only TPM can assign orders to EMO Vendors.

User Flows:

Scheduling EMO Vendors

TPM navigates to "Teostajate andmebaas" and selects desired Vendor
TPM selects the desired date/dates from the EMO calendar.
All selected dates will appear under the calendar selection (as in setting personal vacation days in personal settings)
TPM navigates to Calendar
All EMO vendors that are assigned to work are visible only for TPM on Calendar. Rows for EMO Vendors appear in Yellow.
Assigning orders to EMO Vendors

TPM selects an order from "Tellimused"
TPM selects a "Teostaja" (Vendor), from the dropdown. All available EMO Vendors are marked with a sign "EMO" and appear in Yellow.
Once the order is placed and accepted, the order will appear also in Calendar on the respective EMO Vendor row.

## Figma

https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0---Translation-Hub?node-id=14-3&m=dev

I also have MCP running locally on my Figma desktop if you prefer.

## Backend logic (NOT MADE BY US RIGHT NOW -> WILL BE MADE BY OTHER TEAM SO CAN JUST TAKE AS INFO FOR BACKEND WIRING LATER. BACKEND ISNT READY YET AS WELL SO MOCKS WILL NEED TO BE USED)

# Calendar Backend Implementation Plan

## Design Overview

1. **Language-centric aggregation**: The calendar is organized by language rows. Aggregated views (week/month) return **available vendor counts per language per time block**
2. **Vendor-language association via `prices` table**: Which vendors can serve a given language is determined by the `prices` table, filtering by `skill_id` (spoken interpretation skills) and language classifier value.
3. **Period-based endpoints**: Three calendar endpoints (`/day`, `/week`, `/month`) organized by time granularity, not by user role.
4. **Detail vs Overview**: The day endpoint is the **detail view** (for booking) — returns individual booked slots. Week and month are **overview views** — return aggregated availability counts.
5. **Separate reference data**: Languages, vendor details, and summary statistics are fetched independently when needed.
6. **Expand-all support**: Vendor endpoints work with or without `language_id` — without it, they return all languages in a single query (for TPM "expand all" scenario).

---

## Database Changes

### Create `vendor_calendars` table

| Column                        | Type     | Constraints                                  |
| ----------------------------- | -------- | -------------------------------------------- |
| `id`                          | UUID     | Primary Key                                  |
| `vendor_id`                   | UUID     | FK → `vendors.id`, Required                  |
| `start_at`                    | DateTime | Required                                     |
| `end_at`                      | DateTime | Required                                     |
| `assignment_id`               | UUID     | FK → `assignments.id`, Nullable              |
| `prebook_institution_user_id` | UUID     | FK → `cached_institution_users.id`, Nullable |
| `prebook_at`                  | DateTime | Nullable                                     |
| `metadata`                    | JSON     | Data from imported calendar, Nullable        |
| `vendor_calendar_import_id`   | UUID     | FK → `vendor_calendar_imports.id`, Nullable  |
| `deleted_at`                  | DateTime | Nullable                                     |
| `created_at`                  | DateTime |                                              |
| `updated_at`                  | DateTime |                                              |

**Purpose**: Store vendor calendar events (imported/added) and prebookings.

### Create `vendor_calendar_imports` table

| Column       | Type     | Constraints       |
| ------------ | -------- | ----------------- |
| `id`         | UUID     | Primary Key       |
| `vendor_id`  | UUID     | FK → `vendors.id` |
| `date_from`  | DateTime |                   |
| `date_to`    | DateTime |                   |
| `created_at` | DateTime |                   |
| `updated_at` | DateTime |                   |

**Purpose**: Store vendor calendar imports. Date range is fixed at the endpoint level. If the system requires re-import each week, when a user imports a calendar we take only the next week and store it in the `vendor_calendars` table.

### Create `institution_main_languages` table

| Column           | Type     | Constraints                        |
| ---------------- | -------- | ---------------------------------- |
| `id`             | UUID     | Primary Key                        |
| `institution_id` | UUID     | FK → `cached_institutions.id`      |
| `language_id`    | UUID     | FK → `cached_classifier_values.id` |
| `created_at`     | DateTime |                                    |
| `updated_at`     | DateTime |                                    |

**Purpose**: Store institution configuration for language preferences displayed in the calendar.

### Create `institution_settings` table

| Column           | Type     | Constraints                   |
| ---------------- | -------- | ----------------------------- |
| `id`             | UUID     | Primary Key                   |
| `institution_id` | UUID     | FK → `cached_institutions.id` |
| `reaction_time`  | Integer  |                               |
| `created_at`     | DateTime |                               |
| `updated_at`     | DateTime |                               |

**Purpose**: Store institution-level reaction time.

### Create `project_comments` table

| Column                | Type     | Constraints                        |
| --------------------- | -------- | ---------------------------------- |
| `id`                  | UUID     | Primary Key                        |
| `project_id`          | UUID     | FK → `projects.id`, CASCADE DELETE |
| `comment`             | Text     |                                    |
| `institution_user_id` | UUID     | FK → `cached_institution_users.id` |
| `deleted_at`          | DateTime | Nullable                           |
| `created_at`          | DateTime |                                    |
| `updated_at`          | DateTime |                                    |

### Create `institution_user_pinned_languages` table

| Column                         | Type     | Constraints                                          |
| ------------------------------ | -------- | ---------------------------------------------------- |
| `id`                           | UUID     | Primary Key                                          |
| `institution_user_id`          | UUID     | FK → `cached_institution_users.id`, CASCADE DELETE   |
| `institution_main_language_id` | UUID     | FK → `institution_main_languages.id`, CASCADE DELETE |
| `created_at`                   | DateTime |                                                      |
| `updated_at`                   | DateTime |                                                      |

### Create `institution_user_vacations` table

| Column                | Type | Constraints                        |
| --------------------- | ---- | ---------------------------------- |
| `id`                  | UUID | Primary Key                        |
| `institution_user_id` | UUID | FK → `cached_institution_users.id` |
| `start_date`          | Date | Required                           |
| `end_date`            | Date | Required                           |

**Purpose**: Normalized relational table for vacation data. Populated during sync (in `InstitutionUserRepository::save()`), alongside the existing `cached_institution_users.vacations` JSONB write.

This table is required for SQL-based availability aggregation. The `cached_institution_users.vacations` JSONB field stores both `institution_user_vacations` and `institution_vacations` — during sync, both are flattened into this table for each user.

### Alter `candidates` table

Add `position` column — used to store the sequence/order of candidates for an assignment.

### Alter `projects` table

Add the following columns:

| Column         | Type                       | Description                              |
| -------------- | -------------------------- | ---------------------------------------- |
| `service_type` | Enum (`remote`, `on-site`) | Where spoken interpretation is performed |
| `location`     | Text                       | Place for on-site interpretation         |
| `meeting_link` | Text                       | Link for remote interpretation           |

### Alter `vendors` table

Add column `is_internal` — boolean. `true` for internal vendors, `false` for external vendors.

## Endpoint Inventory

| #   | Endpoint                                         | Purpose                                                    | Fetched When                          |
| --- | ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------- |
| 1   | `POST /api/vendors/calendar/import`              | Import vendor calendar from Outlook CSV                    | On demand                             |
| 2   | `POST /api/projects/{id}/comments`               | Add comment to a project                                   | On demand                             |
| 2   | `DELETE /api/projects/{id}/comments/{commentId}` | Delete comment from a project                              | On demand                             |
| 3   | `GET /api/calendar/languages`                    | Institution main languages + pinned status                 | Once on calendar mount                |
| 4   | `POST /api/institution-users/pinned-languages`   | Pin/unpin languages for calendar                           | On demand                             |
| 5   | `POST /api/institutions/main-languages`          | Set institution main languages                             | On demand (admin)                     |
| 6   | `GET /api/calendar/day`                          | Detailed booked slots for a day (for booking)              | Always on day view load               |
| 7   | `GET /api/calendar/week`                         | Available vendor counts per language per 6h block          | Always on week view load              |
| 8   | `GET /api/calendar/month`                        | Available vendor counts per language per day               | Always on month view load             |
| 9   | `GET /api/calendar/search`                       | Find dates with available slots matching criteria          | User clicks "Leia sobiv aeg"          |
| 10  | `GET /api/calendar/day/vendors`                  | Per-vendor detailed booked slots                           | TPM expands language row (day view)   |
| 11  | `GET /api/calendar/week/vendors`                 | Per-vendor availability per 6h block                       | TPM expands language row (week view)  |
| 12  | `GET /api/calendar/month/vendors`                | Per-vendor availability per day                            | TPM expands language row (month view) |
| 13  | `GET /api/calendar/summary`                      | Accepted orders statistics for a month                     | Month view is active                  |
| 14  | `GET /api/calendar/slot-matching`                | Vendor matching for booking dropdown                       | User creates an order                 |
| 15  | `GET /api/calendar/languages`                    | List of languages that needs to be shown for specific user | Once on calendar mount                |

---

## API Endpoints

### POST `/api/vendors/calendar/import`

**Purpose**: Import vendor calendar from Microsoft Outlook CSV export.

**Request Body**: CSV export file from Microsoft Outlook.

**Response**: TBD — depends on the import flow design.

**Side effects**: Data is stored in the `vendor_calendars` table (with `vendor_calendar_import_id` set) and the `vendor_calendar_imports` table.

---

### POST `/api/projects/{id}/comments`

**Purpose**: Add a comment to a project.

**Request Body**:

| Field     | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `comment` | string | Yes      | Comment text |

**Response Example**:

```json
{
  "id": "comment-uuid-3",
  "comment": "New comment text",
  "institution_user": {
    "id": "user-uuid-1",
    "name": "John Doe"
  },
  "created_at": "2024-01-15T10:00:00Z",
  "project_id": "project-uuid-123"
}
```

---

### GET `/api/calendar/languages`

**Purpose**: Get languages available for calendar display for the current user's institution.

**Query Parameters**: timeframe (optional)

**Response**: List of institution main languages with pinned status for the current user + languages that are comes from orders for specific timeframe.

**Response Example**:

```json
{
  "languages": [
    {
      "language": {
        "id": "79c7ed08-501d-463c-a5b5-c8fd7e0c6179",
        "type": "LANGUAGE",
        "value": "en",
        "name": "English",
        "meta": {
          "iso3_code": "eng"
        }
      },
      "pinned": true
    },
    {
      "language": {
        "id": "d7719f74-3f27-490f-929d-e2d4954e797e",
        "type": "LANGUAGE",
        "value": "et",
        "name": "Estonian",
        "meta": {
          "iso3_code": "est"
        }
      },
      "pinned": false
    }
  ]
}
```

**Usage**:

- **Client**: Pin favourite languages to show at top of calendar.
- **TPM**: Pin languages to show extended vendor sub-rows.

---

### POST `/api/institution-users/pinned-languages`

**Purpose**: Pin/unpin languages for calendar display for the active user.

**Request Body**:

| Field          | Type           | Required | Description                                                                                |
| -------------- | -------------- | -------- | ------------------------------------------------------------------------------------------ |
| `language_ids` | array of UUIDs | Yes      | Language classifier value IDs available for the institution (`institution_main_languages`) |

**Response**: Updated language preferences.

**Questions**:

- Do we need to support language reordering?

---

### POST `/api/institutions/main-languages`

**Purpose**: Add institution main languages for calendar display.

**Request Body**:

| Field          | Type           | Required | Description                                                            |
| -------------- | -------------- | -------- | ---------------------------------------------------------------------- |
| `language_ids` | array of UUIDs | Yes      | Language classifier value IDs that should be displayed in the calendar |

**Questions**:

- How do we display institution main languages? Ordered by adding time / ordered by alphabetical order?

---

### GET `/api/calendar/day`

**Slot size**: 30 minutes (minimum bookable time)

**Purpose**: Detailed view where booking happens. Returns individual booked slots with full assignment data. Slots not present in the response are considered available.

**Query Parameters**:

| Parameter     | Type  | Required | Description                            |
| ------------- | ----- | -------- | -------------------------------------- |
| `date`        | Y-m-d | No       | Defaults to today                      |
| `language_id` | UUID  | No       | Filter by language classifier value ID |

**Response Example**:

```json
{
  "current_time": "2024-01-15T10:30:00Z",
  "booked_slots": [
    {
      "start_at": "2024-01-15T09:00:00Z",
      "end_at": "2024-01-15T10:00:00Z",
      "type": "assignment",
      "assignment": {
        "id": "assignment-uuid-1",
        "sub_project": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "ext_id": "OR-2024-001",
          "source_language": {
            "id": "lang-uuid",
            "value": "en",
            "name": "English"
          },
          "destination_language": {
            "id": "lang-uuid-2",
            "value": "et",
            "name": "Estonian"
          }
        }
      }
    },
    {
      "start_at": "2024-01-15T10:00:00Z",
      "end_at": "2024-01-15T10:30:00Z",
      "type": "external_calendar",
      "assignment": null,
      "meta": "Team standup (imported from Outlook)"
    },
    {
      "start_at": "2024-01-15T13:00:00Z",
      "end_at": "2024-01-15T17:00:00Z",
      "type": "vacation",
      "assignment": null,
      "meta": "Annual leave"
    },
    {
      "start_at": "2024-01-15T14:00:00Z",
      "end_at": "2024-01-15T15:00:00Z",
      "type": "prebook",
      "assignment": null,
      "meta": "Prebooked by Client X"
    }
  ]
}
```

**Slot `type` values**:

| Type                | Description                                        |
| ------------------- | -------------------------------------------------- |
| `assignment`        | Booked by an accepted/pending assignment           |
| `external_calendar` | Imported from vendor's external calendar (Outlook) |
| `vacation`          | Institution or personal vacation                   |
| `prebook`           | Temporarily prebooked for order creation           |

**Role-specific behavior** (same response structure, different data):

| Role       | Returned slots                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vendor** | The vendor's own booked slots                                                                                                                                           |
| **Client** | Slots where ALL vendors for the language are unavailable (= no one can take an order). Slots with `type: assignment` only include assignments belonging to this client. |
| **TPM**    | Same as Client. Per-vendor detail is fetched via `/calendar/day/vendors`.                                                                                               |

**Client-side filtering**:

Filtering by `slot_length`, `start_time`, and `end_time` is done on the client side. The dedicated search endpoint (`GET /api/calendar/search`) handles finding matching dates.

---

### GET `/api/calendar/week`

**Slot size**: 6 hours (4 blocks per day)

**Purpose**: Aggregated overview. Returns **available vendor counts per language** for each 6-hour block. No individual event details.

**Query Parameters**:

| Parameter | Type  | Required | Description                                                        |
| --------- | ----- | -------- | ------------------------------------------------------------------ |
| `date`    | Y-m-d | No       | Defaults to today. The week containing this date will be returned. |

**Response Example**:

```json
{
  "current_time": "2024-01-15T10:30:00Z",
  "week_start": "2024-01-13",
  "week_end": "2024-01-19",
  "languages": [
    {
      "language_id": "lang-uuid-en",
      "total_vendors": 30,
      "slots": [
        {
          "start_at": "2024-01-13T00:00:00Z",
          "end_at": "2024-01-13T06:00:00Z",
          "working_hours": 0,
          "available_vendors": 0,
          "my_bookings_count": 0
        },
        {
          "start_at": "2024-01-13T06:00:00Z",
          "end_at": "2024-01-13T12:00:00Z",
          "working_hours": 4,
          "available_vendors": 25,
          "my_bookings_count": 1
        },
        {
          "start_at": "2024-01-13T12:00:00Z",
          "end_at": "2024-01-13T18:00:00Z",
          "working_hours": 4,
          "available_vendors": 18,
          "my_bookings_count": 0
        },
        {
          "start_at": "2024-01-13T18:00:00Z",
          "end_at": "2024-01-14T00:00:00Z",
          "working_hours": 0,
          "available_vendors": 0,
          "my_bookings_count": 0
        }
      ]
    },
    {
      "language_id": "lang-uuid-et",
      "total_vendors": 5,
      "slots": [
        {
          "start_at": "2024-01-13T06:00:00Z",
          "end_at": "2024-01-13T12:00:00Z",
          "working_hours": 4,
          "available_vendors": 3,
          "my_bookings_count": 0
        }
      ]
    }
  ]
}
```

**Field definitions**:

| Field               | Description                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `total_vendors`     | Total vendors serving this language (from `prices` table)                                |
| `working_hours`     | Number of working hours within this 6-hour block (0 outside working hours)               |
| `available_vendors` | Vendors that have free working time in this block (not fully booked and not on vacation) |
| `my_bookings_count` | Number of the current user's own bookings in this block                                  |

**Availability check**: A vendor is "available" in a 6-hour block if:

1. They serve this language (from `prices` table with spoken interpretation `skill_id`)
2. They are NOT on vacation for the day
3. Their total booked time in the block is less than the working time in the block

**Frontend rendering**:

- `available_vendors / total_vendors` → color intensity (0% = red, 100% = blue)
- `available_vendors == 0` → fully booked (red / "Hõivatud")
- `my_bookings_count > 0` → show booking indicator
- `working_hours == 0` → outside working hours (grey)

**Max slots per response**: 7 days × 4 blocks × 15 languages = **420 slots**

---

### GET `/api/calendar/month`

**Slot size**: 1 day

**Purpose**: Aggregated overview. Returns **available vendor counts per language** for each day. No individual event details.

**Query Parameters**:

| Parameter | Type  | Required | Description                                                         |
| --------- | ----- | -------- | ------------------------------------------------------------------- |
| `date`    | Y-m-d | No       | Defaults to today. The month containing this date will be returned. |

**Response Example**:

```json
{
  "current_time": "2024-01-15T10:30:00Z",
  "month": "2024-01",
  "languages": [
    {
      "language_id": "lang-uuid-en",
      "total_vendors": 30,
      "slots": [
        {
          "date": "2024-01-01",
          "working_hours": 8,
          "available_vendors": 25,
          "my_bookings_count": 1
        },
        {
          "date": "2024-01-02",
          "working_hours": 8,
          "available_vendors": 0,
          "my_bookings_count": 0
        },
        {
          "date": "2024-01-03",
          "working_hours": 0,
          "available_vendors": 0,
          "my_bookings_count": 0
        }
      ]
    },
    {
      "language_id": "lang-uuid-et",
      "total_vendors": 5,
      "slots": [
        {
          "date": "2024-01-01",
          "working_hours": 8,
          "available_vendors": 3,
          "my_bookings_count": 2
        }
      ]
    }
  ]
}
```

**Field definitions**:

| Field               | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `date`              | Day in Y-m-d format                                   |
| `working_hours`     | Working hours for this day (0 for weekends/holidays)  |
| `available_vendors` | Vendors that have free working time on this day       |
| `my_bookings_count` | Number of the current user's own bookings on this day |

**Max slots per response**: 31 days × 15 languages = **465 slots**

---

### GET `/api/calendar/search`

**Purpose**: Find dates with available slots matching the given criteria ("Leia sobiv aeg" feature). Returns a list of **dates** — the user selects one and is navigated to the day view.

**Query Parameters**:

| Parameter     | Type    | Required | Description                                                                  |
| ------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `language_id` | UUID    | Yes      | Language classifier value ID                                                 |
| `date_from`   | Y-m-d   | Yes      | Start of search range                                                        |
| `date_to`     | Y-m-d   | Yes      | End of search range                                                          |
| `slot_length` | integer | Yes      | Minimum consecutive available slot length in minutes (e.g., 30, 60, 90, 120) |
| `start_time`  | H:i     | No       | Earliest time of day to consider (e.g., "09:00")                             |
| `end_time`    | H:i     | No       | Latest time of day to consider (e.g., "17:00")                               |

**Response Example**:

```json
{
  "dates": ["2024-01-15", "2024-01-16", "2024-01-18", "2024-01-22"]
}
```

**Notes**:

- Only dates with at least one matching window are returned.
- The search range (`date_from` to `date_to`) should be bounded to a reasonable maximum (e.g., 1 month) to prevent expensive queries.
- This endpoint operates at 30-minute granularity against `vendor_calendars` directly (not aggregated data).
- After selecting a date, the frontend navigates to `GET /api/calendar/day?date=YYYY-MM-DD&language_id=X`.
- No filtering endpoints are needed for week/month views — they serve as overview/navigation only.

---

### GET `/api/calendar/day/vendors`

**Purpose**: Per-vendor detailed booked slots. Fetched when TPM expands a language row (or "expand all") in the day view.

**Query Parameters**:

| Parameter     | Type  | Required | Description                                                                   |
| ------------- | ----- | -------- | ----------------------------------------------------------------------------- |
| `date`        | Y-m-d | Yes      | Date                                                                          |
| `language_id` | UUID  | No       | If omitted, returns vendors for ALL institution main languages ("expand all") |

**Response Example** (with `language_id`):

```json
{
  "language_id": "lang-uuid-en",
  "vendors": [
    {
      "id": "vendor-uuid-1",
      "institution_user": {
        "id": "user-uuid-1",
        "name": "John Doe"
      },
      "is_internal": true,
      "booked_slots": [
        {
          "start_at": "2024-01-15T09:00:00Z",
          "end_at": "2024-01-15T10:00:00Z",
          "type": "assignment",
          "assignment": {
            "id": "assignment-uuid-1",
            "sub_project": {
              "id": "subproject-uuid",
              "ext_id": "OR-2024-001",
              "source_language": {
                "id": "...",
                "value": "en",
                "name": "English"
              },
              "destination_language": {
                "id": "...",
                "value": "et",
                "name": "Estonian"
              }
            }
          }
        },
        {
          "start_at": "2024-01-15T13:00:00Z",
          "end_at": "2024-01-15T13:30:00Z",
          "type": "external_calendar",
          "assignment": null,
          "meta": "Imported event"
        }
      ]
    },
    {
      "id": "vendor-uuid-2",
      "institution_user": {
        "id": "user-uuid-2",
        "name": "Jane Smith"
      },
      "is_internal": false,
      "booked_slots": []
    }
  ]
}
```

**Response Example** (without `language_id` — "expand all"):

```json
{
  "languages": [
    {
      "language_id": "lang-uuid-en",
      "vendors": [
        {
          "id": "vendor-uuid-1",
          "institution_user": { "id": "user-uuid-1", "name": "John Doe" },
          "is_internal": true,
          "booked_slots": [...]
        }
      ]
    },
    {
      "language_id": "lang-uuid-et",
      "vendors": [...]
    }
  ]
}
```

Slot structure and `type` values are the same as `GET /api/calendar/day`.

**Backend optimization**: When returning all languages, each vendor's bookings are computed **once** and mapped to all languages they serve. A vendor serving 3 languages does not trigger 3 separate queries.

---

### GET `/api/calendar/week/vendors`

**Purpose**: Per-vendor availability per 6-hour block. Fetched when TPM expands a language row (or "expand all") in the week view.

**Query Parameters**:

| Parameter     | Type  | Required | Description                                      |
| ------------- | ----- | -------- | ------------------------------------------------ |
| `date`        | Y-m-d | Yes      | The week containing this date will be used       |
| `language_id` | UUID  | No       | If omitted, returns all languages ("expand all") |

**Response Example** (with `language_id`):

```json
{
  "language_id": "lang-uuid-en",
  "week_start": "2024-01-13",
  "week_end": "2024-01-19",
  "vendors": [
    {
      "id": "vendor-uuid-1",
      "institution_user": { "id": "user-uuid-1", "name": "John Doe" },
      "is_internal": true,
      "slots": [
        {
          "start_at": "2024-01-13T06:00:00Z",
          "end_at": "2024-01-13T12:00:00Z",
          "available": true,
          "booked_hours": 2
        },
        {
          "start_at": "2024-01-13T12:00:00Z",
          "end_at": "2024-01-13T18:00:00Z",
          "available": false,
          "booked_hours": 4
        }
      ]
    },
    {
      "id": "vendor-uuid-2",
      "institution_user": { "id": "user-uuid-2", "name": "Jane Smith" },
      "is_internal": false,
      "slots": [
        {
          "start_at": "2024-01-13T06:00:00Z",
          "end_at": "2024-01-13T12:00:00Z",
          "available": false,
          "on_vacation": true
        }
      ]
    }
  ]
}
```

**Response** (without `language_id` — "expand all"): Wrapped in a `languages` array, same pattern as `day/vendors`.

**Per-vendor slot fields**:

| Field          | Description                                             |
| -------------- | ------------------------------------------------------- |
| `available`    | Whether the vendor has free working time in this block  |
| `booked_hours` | Hours booked within this block (omitted if on vacation) |
| `on_vacation`  | Present and `true` if vendor is on vacation             |

---

### GET `/api/calendar/month/vendors`

**Purpose**: Per-vendor availability per day. Fetched when TPM expands a language row (or "expand all") in the month view.

**Query Parameters**:

| Parameter     | Type  | Required | Description                                      |
| ------------- | ----- | -------- | ------------------------------------------------ |
| `date`        | Y-m-d | Yes      | The month containing this date will be used      |
| `language_id` | UUID  | No       | If omitted, returns all languages ("expand all") |

**Response Example** (with `language_id`):

```json
{
  "language_id": "lang-uuid-en",
  "month": "2024-01",
  "vendors": [
    {
      "id": "vendor-uuid-1",
      "institution_user": { "id": "user-uuid-1", "name": "John Doe" },
      "is_internal": true,
      "slots": [
        { "date": "2024-01-01", "available": true, "booked_hours": 3 },
        { "date": "2024-01-02", "available": true, "booked_hours": 0 },
        { "date": "2024-01-03", "available": false, "booked_hours": 8 }
      ]
    },
    {
      "id": "vendor-uuid-2",
      "institution_user": { "id": "user-uuid-2", "name": "Jane Smith" },
      "is_internal": false,
      "slots": [
        { "date": "2024-01-01", "available": true, "booked_hours": 0 },
        { "date": "2024-01-02", "available": false, "on_vacation": true },
        { "date": "2024-01-03", "available": false, "on_vacation": true }
      ]
    }
  ]
}
```

**Response** (without `language_id` — "expand all"): Wrapped in a `languages` array.

---

### GET `/api/calendar/summary`

**Purpose**: Accepted order statistics per language for a month.

**Query Parameters**:

| Parameter | Type | Required | Description              |
| --------- | ---- | -------- | ------------------------ |
| `month`   | Y-m  | Yes      | Month to get summary for |

**Response Example**:

```json
{
  "month": "2024-01",
  "summary": [
    {
      "language": {
        "id": "lang-uuid-1",
        "value": "en",
        "name": "English"
      },
      "accepted_projects_count": 15,
      "total_duration_minutes": 450
    },
    {
      "language": {
        "id": "lang-uuid-2",
        "value": "et",
        "name": "Estonian"
      },
      "accepted_projects_count": 8,
      "total_duration_minutes": 240
    }
  ],
  "total": {
    "accepted_projects_count": 23,
    "total_duration_minutes": 690
  }
}
```

---

### GET `/api/calendar/slot-matching`

**Purpose**: Get vendors that match the client project for the order creation dropdown. This is where the Matching Algorithm is called.

**Query Parameters**:

| Parameter     | Type     | Required | Description                  |
| ------------- | -------- | -------- | ---------------------------- |
| `start_at`    | DateTime | Yes      | Slot start datetime          |
| `end_at`      | DateTime | Yes      | Slot end datetime            |
| `language_id` | UUID     | Yes      | Language classifier value ID |

**Response**: List of vendors ordered based on the matching score.

---

## Aggregation Computation

### How availability is determined

For aggregated views (week/month), a vendor is considered **available** for a time block if:

1. They serve the language (from `prices` table with spoken interpretation `skill_id`)
2. They are **NOT** on vacation for that day
3. Their total booked time in the block **<** working time in the block

**Data sources**:

| Data                    | Source                                                     | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| Vendor-language mapping | `prices` table (`skill_id` + language)                     | Determine which vendors serve which language               |
| Booked time             | `vendor_calendars` table                                   | Assignments, external calendar imports, prebooks           |
| Vacations               | `institution_user_vacations` table (normalized from JSONB) | Full-day unavailability                                    |
| Working hours           | `institution_settings`                                     | Defines working time per day (e.g., 08:00–16:00 = 8 hours) |

## Frontend Fetch Strategy

```
Calendar mount:
  ├── GET /calendar/languages                 (once, cached)
  └── GET /calendar/{day|week|month}          (on view change or navigation)

Month view active:
  └── GET /calendar/summary                   (on month change)

TPM expands a single language row:
  ├── Day view:   GET /calendar/day/vendors?date=X&language_id=Y
  ├── Week view:  GET /calendar/week/vendors?date=X&language_id=Y
  └── Month view: GET /calendar/month/vendors?date=X&language_id=Y

TPM clicks "expand all" (or 3+ languages pinned):
  ├── Day view:   GET /calendar/day/vendors?date=X     (no language_id)
  ├── Week view:  GET /calendar/week/vendors?date=X    (no language_id)
  └── Month view: GET /calendar/month/vendors?date=X   (no language_id)

TPM collapses rows:
  └── (no API call — aggregated data already loaded)

User clicks "Leia sobiv aeg" (fast search):
  ├── GET /calendar/search?language_id=X&date_from=Y&date_to=Z&slot_length=60&start_time=09:00&end_time=17:00
  ├── User selects a date from results → navigates to day view
  ├── GET /calendar/day?date=SELECTED_DATE&language_id=X
  └── TPM: auto-expands vendor sub-rows → GET /calendar/day/vendors?date=SELECTED_DATE&language_id=X

User starts booking:
  └── GET /calendar/slot-matching?start_at=X&end_at=Y&language_id=Z
```

---

## Matching Algorithm

The process of matching vendors to a client project is called in multiple places:

- When a new project is created — calculate candidates with proper ordering.
- When creating a new project — show the dropdown with vendors via `/api/calendar/slot-matching`.

The matching process includes the following steps:

1. Get vendors that satisfy the restrictions (language, skill, institution).
2. Filter vendors by checking if the requested slot is available for them.
3. Prioritize internal vendors (`is_internal = true`) over external ones.
4. Calculate the order based on labels, pricing (for external vendors), etc.

If the project is created, the result of the algorithm is stored in the `candidates` table. Otherwise, the results are returned to display in the dropdown.

---

## Relations & Side Effects

- When a project is deleted/cancelled → remove the booking from `vendor_calendars`.
- When a prebooking expires → remove it from `vendor_calendars`.
