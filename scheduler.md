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
             1. orders assigned to the user corresponding to languages are being displayed and if the user has a blocked time in the calendar then this is displayed across the language rows or
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
    5.  red with a label "Hõivatud" - personal booking from imported calendar or under personal settings, meaning that the person is not available for work
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
   1. filter by 1. language - Mandatory 2. timeframe - If timeframe is not selected then search result will present the next 30 days 3. slot length. - Optional
   2. Upon selecting the parameters and clicking button "Leia sobiv aeg"
      1. The system will automatically navigate the user to corresponding day view, matching the filter criteria and corresponding rows are being displayed and
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
   5. "Teostaja" a dropdown with available Translators for the chosen time slot and if the user has a correct privilege.
      5.1 In addition to regular Translators, there will be EMO translators listed in selection. EMO translators are indicated with Yellow colour and with a sign - EMO.
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

**Note!** This way of adding an order can be used to add orders for any language. This also menas that this is the only way to add orders for languages that are NOT marked as main languages and are therefore not displayed in the main calendar component as rows. Additionally, client can add orders for the main languages even all the timeslots are booked.

1. User clicks on
   1. "Veel" -> "Lisa tellimus" on the toolbar or
   2. opens the detail view from the side panel "Ava" to open the detail view.
2. All the fields are displayed using the same logic as for the side panel.
3. Timeframe of the order can be chosen using the "kuupäev ja kellaaeg" and "kestus" and
   1. if the language chosen is main language then after selecting a time slot which is not available or the duration is longer then available then notification is shown to user "Selected time slot for the order is not available, therefore the order management will be done manually by person" ("Tellimuseks valitud aeg on hõivatud. Tellimusega tegeleb tõlkekorraldaja manuaalselt. or
   2. if the language is not main language (harvikkeel), then any time and date (following the overall rule of not adding orders to the same day) are allowed.
4. User can void the pre order by clicking on secondary button "Katkesta" and
   1. the detail view is closed and
   2. the pre booking is voided.
5. User can click on primary action button "Loo tellimus" in order to create the order and
   1. if the language of the the order is a main language then the order will be assigned to the Translator nad the Translator will get a notification or
   2. if the language is NOT a main language then the order is assigned to TPM and the TPM will get a notification.

---

### Accepting & declining an order

1. Vendor receives an email containing information about assigned order: Project reference number, Title, Message
   - User navigates to Tellimused > Minu Ülesanded > Ootel ülesanded
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
4. When user clicks on button "Tühista" then 1. the system throws a double confirmation and 1. if the confirmation is negative then returns to editable state or 2. if the confirmation is positive then 1. voids the order and 2. sends a notification about voiding to 1. the Client and 2. the Translator and 3. if the order had no Translator assigned (it was created for harvikkeel but not yet assigned to a translator by the TPM), then to this TPM.
   Orders can be edited, changed and deleted up until the order is finished/done.

---

### Managing EMO translators

Summary:
In case all the available time slots are full, client must be still able to book an order. All such orders will appear in regular orders (Tellimused) list and respective notification is also sent to TPM once the order is created. TPM must manually find a translators/Vendor from the available vendors/translators list. In such list, there are regular vendors/translators and also so called EMO vendors/translators. TPM can assign manually EMO vendors to take care of the order.

TPM is responsible of booking Vendors/translators to EMO shift. Once the Vendor is on EMO shift, the system does not assign any orders to them automatically, only TPM can assign orders to EMO Vendors.

User Flows:

Scheduling EMO Vendors

- TPM navigates to "Teostajate andmebaas" and selects desired Vendor
- TPM selects the desired date/dates from the EMO calendar.
- All selected dates will appear under the calendar selection (as in setting personal vacation days in personal settings)
- TPM navigates to Calendar
- All EMO vendors that are assigned to work are visible only for TPM on Calendar. Rows for EMO Vendors appear in Yellow.

Assigning orders to EMO Vendors

- TPM selects an order from "Tellimused"
- TPM selects a "Teostaja" (Vendor), from the dropdown. All available EMO Vendors are marked with a sign "EMO" and appear in Yellow.
- Once the order is placed and accepted, the order will appear also in Calendar on the respective EMO Vendor row.

---

### Slot matching algorithms (for main languages)

Slot matching algorithm is the core set of rules and checks that is being used for finding and displaying available time slots for orders. Available slots are calculated when user:

- navigates to to the Calendar component and
- is adding an order from the order detail view.

#### Algorithm 1: from all to available

1. System gets the translation language and order date/time as and input and the language is main laguage.
2. System does the following in this order to narrow down the potential matches:
   1. finds the translators who support the selected language and if it matches then for this group
   2. finds the translators who have imported their personal calendars for the given date and for those who have
   3. finds if the found translators have a blocking event based on their personal calendars and if not then
   4. finds if they have other prebooked or booked orders for the slot and if not then a matching translator(s) are found.
3. System returns the list of matching translators.

#### Algorithm 2: finding the best match from internal translators as a priority

System then evaluates who would be the best match out of all available matches. This is needed for the cases when multiple matches are found and the matching is done by the system (and not manually by the TPM).

1. System uses the output from Algorithm 1 as an input.
2. System does the following in this order to find the sequence of the best matches:
   1. finds if the translator is external or internal and
      1. if there is just one internal translator then this translator is the match or
      2. if there are multiple internal translators then the priority of matching is done based on the following priority
         1. comparing the labels of the translators' with the labels added to the order and if there is a matching label then this is the match and if there are none matching based on label or multiple matching based on label then
         2. comparing the total length of the orders for the same week where the best match would be the the translator who has least orders for the period and if there aren't any orders or the total length of the orders is the same for multiple translators then
         3. comparing the total lenght oof the orders for the same day where the best match is the translator with least orders and if there are still multiple matches then
         4. system picks the first one alphabetically.
3. System returns the best match which is an internal translator.

#### Algorithm 3: external translator sequencing and cascade method

If there are no internal translators to be used for an order then TPM shall have an option to trigger the system to evaluate external translators and include them into the process. For sending out requests in a cascade for an order a certain sequence and reaction time frame is being used.

1. System uses the output from Algorithm 1 and found external translators from Algorithm 2 as an input.
2. In case TPM triggers the logic for including external translators, system does the following in this order to find the sequence of the best matches:
   1. compares the price for the order where least is best and creates a sequence based on this.
3. Based on the sequence, system
   1. sends out a notification to the first external translator in the sequence and
   2. saves the time for sending out the notification.
4. The external translator will have a reaction time set by the institution admin to accept the order and
   1. if the translator accepts the order then it will be assigned to this translator or
   2. if the translator declines the order or fails to accept it within the time frame then
      1. the system goes back to step 3 and finds the next in the sequence and the next steps are repeated.

User flow - **Including External translators**

- TPM opens the order
- TPM fills in all the details needed as in handling every other order
- TPM selects "Lepinguline tõlk/Väline tõlk" from "Teostaja" dropdown, which will trigger the algorithm 3 to include external translators.

---

### Notifications

Notifications are sent by the system via email. Notifications are sent out in the following occasions:

1. When the order is
   1. created for
      1. a main language – to Translator
      2. a language not main language - to TPM.
   2. accepted - to Client who created it.
   3. changed by one of the parties
      1. to Client who created it and
      2. to assigned Ta ranslator and
      3. to the related TPM.
   4. declined or failed to accept within the reaction time -
      1. to the Client and
      2. the Translator and 3. if the order had no Translator assigned (it was created for harvikkeel but not yet assigned to a translator by the TPM), then to this TPM.
   5. Calendar import reminder - Reminder is sent to "Teostaja" 2 working days before the imported calendar expires.

---

### Reaction time

Reaction time is the time frame within the translator can either accept or decline the order. If the translator does not accept the order within then the order is declined automatically and goes to the next translator picked based on the algorithm.

Option to set the reaction time shall be configured on the company level under the "Asutuse Sätted" page.
Reaction time shall be defined in minutes, default shall be 30 minutes. There shall be also informative button explaining the meaning of the setting. Explanation inside the informative button: "Reaction time is the time frame within the translator can either accept or decline the order. If the translator does not accept the order within the set timeframe then the order is declined automatically and goes to the next translator picked based on the algorithm."

---

### Calendar import

Each translator must import the calendar in order to make themselves available as a translator.
Calendar import shall be done through Translator personal page (Teostajad). There shall be separate section called "Kalendri Sätted" under which user can see the setting "Impordi Kalender" and a button "Impordi failist", which will enable user to import the calendar to the system.
Only supported import file type is .ics

There shall be additional notification introduced. Notification shall be sent to "Teostaja" 2 working days before the imported calendar expires, reminding the "Teostaja" to import new calendar.

# Sub Components

## Order Detail View

Oder detail view is a full page view of an order for adding, editing and voiding the order. It has an extended functionality compared to the Order Sheet but in it's core it is the same.

Order detail view is the only way to add an order for adding orders for languages that are not main languages (are "harvikkeeled").

### Design

- [TPM view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=126-3076&m=dev&t=AGR61h83jzMcO7kj-1)
- [Client view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=889-25705&m=dev&t=eESxaGeFVjXCpHRq-1)
- [Translator view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=14-3&m=dev&t=eESxaGeFVjXCpHRq-1)

### Rules & Functional Details

---

| #   | Functionality | Rule | Outcome |
| --- | ------------- | ---- | ------- |
| 1   |               |      |         |

## Order Sheet

Order sheet is a side panel used to add/edit and void an order. It opens on the Calender view.

### Design

- [TPM view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=893-59348&m=dev&t=eESxaGeFVjXCpHRq-1)
- [Client view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=881-103110&m=dev&t=eESxaGeFVjXCpHRq-1)
- [Translator view](https://www.figma.com/design/3PLabFR6bgsvqsipbClHbL/EKI-t%C3%B5lkev%C3%A4rav-2.0?node-id=881-76375&m=dev&t=eESxaGeFVjXCpHRq-1)

### Rules & Functional Details

---

| #   | Functionality | Rule | Outcome |
| --- | ------------- | ---- | ------- |
| 1   |               |      |         |

## Calendar

Calendar is the main component for the spoken interpretation to find available slots and find your orders. Depending on the user role, it carries a slightly different function.

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
