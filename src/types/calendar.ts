export type CalendarView = 'day' | 'week' | 'month'

export type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

export type SlotType =
  | 'assignment'
  | 'external_calendar'
  | 'vacation'
  | 'prebook'

export interface CalendarLanguage {
  language: {
    id: string
    /** UUID used for pin/unpin API calls */
    institution_main_language_id?: string
    type: string
    value: string
    name: string
    meta: { iso3_code: string }
  }
  pinned: boolean
  is_rare?: boolean
}

export interface CalendarLanguagesResponse {
  languages: CalendarLanguage[]
}

// --- Day view ---

export interface BookedSlotAssignment {
  id: string
  confirmed?: boolean
  status?: 'NEW' | 'IN_PROGRESS' | 'DONE'
  sub_project: {
    id: string
    ext_id: string
    source_language: { id: string; value: string; name: string }
    destination_language: { id: string; value: string; name: string }
  }
  service_type?: 'REMOTE' | 'ON_SITE'
  location?: string
  meeting_link?: string
  reference_number?: string
  client?: {
    name: string
    institution: string
    email: string
    phone: string
  }
  coordinator?: {
    name: string
    email: string
    phone: string
  }
  updated_at?: string
  files?: Array<{ name: string }>
  comments?: Array<{ author: string; text: string; created_at: string }>
  last_comment_date?: string
  price_per_minute?: string
  billing_method?: string
}

export interface BookedSlot {
  start_at: string
  end_at: string
  type: SlotType
  assignment: BookedSlotAssignment | null
  meta?: string
}

export interface CalendarDayResponse {
  current_time: string
  /** Translator role: all their own booked slots (no language key needed) */
  booked_slots: BookedSlot[]
  /** Client role: booked slots grouped by language_id */
  booked_slots_by_language: Record<string, BookedSlot[]>
  /** TPM role: vendor-level breakdown per language */
  tpm_vendors?: Array<{ language_id: string; vendors: VendorDayData[] }>
}

// --- Week view ---

export interface WeekSlot {
  start_at: string
  end_at: string
  working_hours: number
  available_vendors: number
  my_bookings_count: number
}

export interface LanguageWeekData {
  language_id: string
  total_vendors: number
  slots: WeekSlot[]
}

export interface CalendarWeekResponse {
  current_time: string
  week_start: string
  week_end: string
  languages: LanguageWeekData[]
  tpm_vendors?: Array<{ language_id: string; vendors: VendorWeekData[] }>
}

// --- Month view ---

export interface MonthSlot {
  date: string
  working_hours: number
  available_vendors: number
  my_bookings_count: number
}

export interface LanguageMonthData {
  language_id: string
  total_vendors: number
  slots: MonthSlot[]
}

export interface CalendarMonthResponse {
  current_time: string
  month: string
  languages: LanguageMonthData[]
  tpm_vendors?: Array<{ language_id: string; vendors: VendorMonthData[] }>
}

// --- Vendor sub-rows (TPM) ---

export interface VendorDayData {
  id: string
  institution_user: { id: string; name: string }
  is_internal: boolean
  booked_slots: BookedSlot[]
}

export interface CalendarDayVendorsResponse {
  language_id: string
  vendors: VendorDayData[]
}

export interface CalendarDayVendorsAllResponse {
  languages: Array<{
    language_id: string
    vendors: VendorDayData[]
  }>
}

export interface VendorWeekSlot {
  start_at: string
  end_at: string
  available: boolean
  booked_hours?: number
  on_vacation?: boolean
}

export interface VendorWeekData {
  id: string
  institution_user: { id: string; name: string }
  is_internal: boolean
  slots: VendorWeekSlot[]
}

export interface CalendarWeekVendorsResponse {
  language_id: string
  week_start: string
  week_end: string
  vendors: VendorWeekData[]
}

export interface CalendarWeekVendorsAllResponse {
  languages: Array<{
    language_id: string
    vendors: VendorWeekData[]
  }>
}

export interface VendorMonthSlot {
  date: string
  available: boolean
  booked_hours?: number
  on_vacation?: boolean
}

export interface VendorMonthData {
  id: string
  institution_user: { id: string; name: string }
  is_internal: boolean
  slots: VendorMonthSlot[]
}

export interface CalendarMonthVendorsResponse {
  language_id: string
  month: string
  vendors: VendorMonthData[]
}

export interface CalendarMonthVendorsAllResponse {
  languages: Array<{
    language_id: string
    vendors: VendorMonthData[]
  }>
}

// --- Order detail view ---

export interface CalendarOrderDetail {
  id: string
  ext_id: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  language: { id: string; value: string; name: string }
  start_at: string
  end_at: string
  service_type: 'REMOTE' | 'ON_SITE'
  location?: string
  meeting_link?: string
  domain?: string
  reference_number?: string
  created_at: string
  updated_at?: string
  accepted_at?: string
  cancel_at?: string
  cancelled_at?: string
  completed_at?: string
  client?: { name: string; institution: string; email: string; phone: string }
  client_institution_user?: { id: string }
  coordinator?: { name: string; email: string; phone: string }
  tags?: Array<{ id: string; name: string }>
  source_files?: Array<{
    id: string
    name: string
    file_name: string
    size: number
  }>
  files_count: number
  files_accessible: boolean
  project_comments?: Array<{
    id: string
    institution_user_id: string
    comment: string
    created_at: string
  }>
}

// --- Week slot bookings (Teostaja panel) ---

export interface WeekSlotBooking {
  id: string
  ext_id: string
  language: { id: string; value: string; name: string }
}

export interface WeekSlotBookingsResponse {
  bookings: WeekSlotBooking[]
}

// --- Search ---

export interface CalendarSearchParams {
  language_id: string
  datetime: string
  duration_minutes: number
}

export interface CalendarSearchResponse {
  start_at: string | null
}

// --- Create order ---

export interface CreateOrderPayload {
  language_id: string
  start_at: string
  end_at: string
  service_type: 'REMOTE' | 'ON_SITE'
  reference_number?: string
  location?: string
  meeting_link?: string
  client_institution_id?: string
  tag_ids?: string[]
  vendor_id?: string
  comment?: string
}

// --- Update order ---

export interface UpdateOrderPayload {
  id: string
  service_type?: 'REMOTE' | 'ON_SITE'
  reference_number?: string
  location?: string
  meeting_link?: string
  client_institution_id?: string
  start_at?: string
  end_at?: string
  tag_ids?: string[]
  vendor_id?: string
}

// --- Slot matching ---

export interface SlotMatchingVendor {
  id: string
  institution_user_id: string
  name: string | null
  is_internal: boolean
}

export interface CalendarSlotMatchingResponse {
  vendors: SlotMatchingVendor[]
}

// ---------------------------------------------------------------------------
// Raw API response types (backend shapes before transformation)
// ---------------------------------------------------------------------------

// ---- Languages ----

/** ClassifierValueResource (language) */
export interface ApiClassifierLanguage {
  id: string
  type: string
  value: string
  name: string
  meta?: { iso3_code?: string }
}

/** InstitutionMainLanguageResource */
export interface ApiMainLanguage {
  id: string
  institution_id: string
  language_id: string
  language: ApiClassifierLanguage
}

/** InstitutionUserPinnedLanguageResource */
export interface ApiPinnedLanguage {
  id: string
  institution_user_id: string
  institution_main_language_id: string
  institution_main_language?: ApiMainLanguage
}

export interface ApiCalendarLanguagesResponse {
  main_languages: ApiMainLanguage[]
  pinned_languages: ApiPinnedLanguage[]
  project_languages: ApiClassifierLanguage[]
}

// ---- Day view ----

/** VendorCalendarEntryResource */
export interface ApiVendorCalendarEntry {
  id: string
  vendor_id: string
  start_at: string
  end_at: string
  type: 'assignment' | 'prebook' | 'external_calendar' | 'vacation'
  assignment_id: string | null
  assignment?: ApiAssignmentSummary | null
}

export interface ApiAssignmentSummary {
  id: string
  ext_id: string
  event_start_at?: string
  deadline_at?: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  subProject?: {
    id: string
    ext_id: string
    project?: {
      id: string
      ext_id: string
      status?: 'NEW' | 'IN_PROGRESS' | 'DONE'
      service_type?: 'REMOTE' | 'ON_SITE'
      location?: string
      meeting_link?: string
      reference_number?: string
      client_institution_user?: {
        user: { forename: string; surname: string; email: string; phone?: string }
        institution: { name: string }
      }
      manager_institution_user?: {
        user: { forename: string; surname: string; email: string; phone?: string }
      }
    }
  }
}

/** CalendarInstitutionUserResource */
export interface ApiCalendarInstitutionUser {
  id: string
  user: { forename: string; surname: string }
}

/** VendorCalendarExpandResource — used in TPM day/week/month */
export interface ApiVendorExpand {
  id: string
  institutionUser: ApiCalendarInstitutionUser | null
  languages: string[]
  emergency_schedules: ApiEmergencySchedule[]
  calendar_entries?: ApiVendorCalendarEntry[]
}

export interface ApiEmergencySchedule {
  id: string
  vendor_id: string
  start_date: string
  end_date: string
  created_at: string
}

/** UnassignedProjectCalendarResource */
export interface ApiUnassignedProject {
  id: string
  ext_id: string
  event_start_at: string
  event_end_at: string | null
  status: string
  service_type: string | null
  location: string | null
  meeting_link: string | null
  source_language_classifier_value_id: string | null
  destination_language_classifier_value_ids: string[]
}

// Vendor day: { calendar_entries: VendorCalendarEntryResource[] }
export interface ApiCalendarDayVendorShape {
  calendar_entries: ApiVendorCalendarEntry[]
}

// Client day: available_slots, booked_slots, calendar_entries, unassigned_projects
export interface ApiCalendarDayClientShape {
  available_slots: Array<{
    start_at: string
    end_at: string
    languages: string[]
  }>
  booked_slots: Array<{ start_at: string; end_at: string; languages: string[] }>
  calendar_entries: ApiVendorCalendarEntry[]
  unassigned_projects: ApiUnassignedProject[]
}

// TPM day: available_slots (with vendor_ids), vendors metadata
export interface ApiCalendarDayTpmShape {
  available_slots: Array<{
    start_at: string
    end_at: string
    vendor_ids: string[]
  }>
  vendors: ApiVendorExpand[]
}

export type ApiCalendarDayResponse =
  | ApiCalendarDayVendorShape
  | ApiCalendarDayClientShape
  | ApiCalendarDayTpmShape

// ---- Week view ----

// Vendor week: { slots: VendorCalendarWeekAggregationResource[] }
export interface ApiCalendarWeekVendorShape {
  slots: Array<{
    language_id: string
    start_at: string
    end_at: string
    calendar_entries: ApiVendorCalendarEntry[]
  }>
}

// Client week: { slots: ClientCalendarWeekAggregationResource[] }
export interface ApiCalendarWeekClientShape {
  slots: Array<{
    language_id: string
    start_at: string
    end_at: string
    total_vendors: number
    available_vendors: number
  }>
}

// TPM week: { available_slots: [...], vendors: [...] }
export interface ApiCalendarWeekTpmShape {
  available_slots: Array<{
    language_id: string
    start_at: string
    end_at: string
    vendor_ids: string[]
  }>
  vendors: ApiVendorExpand[]
}

export type ApiCalendarWeekResponse =
  | ApiCalendarWeekVendorShape
  | ApiCalendarWeekClientShape
  | ApiCalendarWeekTpmShape

// ---- Month view ----

// Vendor/Client month: { slots: CalendarMonthAggregationResource[] }
export interface ApiCalendarMonthClientShape {
  slots: Array<{
    language_id: string
    date: string
    vendor_hours: number
  }>
}

// TPM month: { available_slots: [...], vendors: [...] }
export interface ApiCalendarMonthTpmShape {
  available_slots: Array<{
    language_id: string
    date: string
    vendor_hours: Record<string, number>
  }>
  vendors: ApiVendorExpand[]
}

export type ApiCalendarMonthResponse =
  | ApiCalendarMonthClientShape
  | ApiCalendarMonthTpmShape

// ---- Slot matching ----

/** SlotMatchingVendorResource */
export interface ApiSlotMatchingVendor {
  id: string
  institution_user_id: string
  name: string | null
  is_internal: boolean
}

// ---- Search ----

/** CalendarSearchSlotResource */
export interface ApiCalendarSearchResponse {
  start_at: string | null
  end_at: string | null
  vendor_ids: string[] | null
  language_id: string | null
}

// ---- Prebook ----

export interface ApiPrebookResponse {
  calendar_entry: ApiVendorCalendarEntry
  expires_at: string
}

// ---------------------------------------------------------------------------
// Transform functions
// ---------------------------------------------------------------------------

export function transformLanguages(
  api: ApiCalendarLanguagesResponse
): CalendarLanguagesResponse {
  const pinnedIds = new Set(
    api.pinned_languages?.map((p) => p.institution_main_language_id)
  )
  const seen = new Set<string>()
  const languages: CalendarLanguage[] = []

  for (const main of api.main_languages ?? []) {
    const lang = main.language
    if (seen.has(lang.id)) continue
    seen.add(lang.id)
    languages.push({
      language: {
        id: lang.id,
        institution_main_language_id: main.id,
        type: lang.type ?? 'LANGUAGE',
        value: lang.value,
        name: lang.name,
        meta: { iso3_code: lang.meta?.iso3_code ?? '' },
      },
      pinned: pinnedIds.has(main.id),
    })
  }

  for (const lang of api.project_languages ?? []) {
    if (seen.has(lang.id)) continue
    seen.add(lang.id)
    languages.push({
      language: {
        id: lang.id,
        institution_main_language_id: undefined,
        type: lang.type ?? 'LANGUAGE',
        value: lang.value,
        name: lang.name,
        meta: { iso3_code: lang.meta?.iso3_code ?? '' },
      },
      pinned: false,
    })
  }

  return { languages }
}

// ---- Day transforms ----

function isVendorDayShape(
  api: ApiCalendarDayResponse
): api is ApiCalendarDayVendorShape {
  return 'calendar_entries' in api && !('available_slots' in api)
}

function isTpmDayShape(
  api: ApiCalendarDayResponse,
  isTPM?: boolean
): api is ApiCalendarDayTpmShape {
  if (!('available_slots' in api)) return false
  const tpm = api as ApiCalendarDayTpmShape
  if (!Array.isArray(tpm.available_slots)) return false
  // Empty array: fall back to role hint
  if (tpm.available_slots.length === 0 && 'vendors' in api)
    return isTPM === true
  return 'vendor_ids' in (tpm.available_slots[0] ?? {})
}

export function transformDayResponse(
  api: ApiCalendarDayResponse,
  languageId?: string,
  isTPM?: boolean
): CalendarDayResponse {
  if (isVendorDayShape(api)) {
    // Translator shape: own calendar entries, no language breakdown available
    const vendorShape = api as ApiCalendarDayVendorShape
    return {
      current_time: new Date().toISOString(),
      booked_slots: vendorShape.calendar_entries.map((e) => ({
        start_at: e.start_at,
        end_at: e.end_at,
        type: e.type,
        assignment: e.assignment
          ? {
              id: e.assignment.id,
              ext_id: e.assignment.ext_id,
              status: e.assignment.status as BookedSlotAssignment['status'],
              sub_project: {
                id: e.assignment.id,
                ext_id: e.assignment.ext_id,
                source_language: { id: '', value: '', name: '' },
                destination_language: { id: '', value: '', name: '' },
              },
            }
          : null,
      })),
      booked_slots_by_language: {},
    }
  }

  if (isTpmDayShape(api, isTPM)) {
    const tpm = api as ApiCalendarDayTpmShape
    const vendorsByLanguage = new Map<string, VendorDayData[]>()
    for (const v of tpm.vendors) {
      const vendorData: VendorDayData = {
        id: v.id,
        institution_user: {
          id: v.institutionUser?.id ?? v.id,
          name: v.institutionUser
            ? `${v.institutionUser.user.forename} ${v.institutionUser.user.surname}`.trim()
            : v.id,
        },
        is_internal: v.emergency_schedules.length === 0,
        booked_slots: (v.calendar_entries ?? []).map((e) => ({
          start_at: e.start_at,
          end_at: e.end_at,
          type: e.type,
          assignment: e.assignment_id
            ? (() => {
                const proj = e.assignment?.subProject?.project
                const clientUser = proj?.client_institution_user
                const managerUser = proj?.manager_institution_user
                return {
                  id: e.assignment_id,
                  status: (proj?.status ?? e.assignment?.status) as BookedSlotAssignment['status'],
                  service_type: proj?.service_type,
                  location: proj?.location,
                  meeting_link: proj?.meeting_link,
                  reference_number: proj?.reference_number,
                  client: clientUser
                    ? {
                        name: [clientUser.user.forename, clientUser.user.surname].filter(Boolean).join(' '),
                        institution: clientUser.institution.name,
                        email: clientUser.user.email,
                        phone: clientUser.user.phone ?? '',
                      }
                    : undefined,
                  coordinator: managerUser
                    ? {
                        name: [managerUser.user.forename, managerUser.user.surname].filter(Boolean).join(' '),
                        email: managerUser.user.email,
                        phone: managerUser.user.phone ?? '',
                      }
                    : undefined,
                  sub_project: {
                    id: proj?.id ?? e.assignment_id,
                    ext_id: proj?.ext_id ?? e.assignment?.ext_id ?? '',
                    source_language: { id: '', value: '', name: '' },
                    destination_language: { id: '', value: '', name: '' },
                  },
                }
              })()
            : null,
        })),
      }
      for (const langId of v.languages) {
        if (!vendorsByLanguage.has(langId)) vendorsByLanguage.set(langId, [])
        vendorsByLanguage.get(langId)!.push(vendorData)
      }
    }

    const languageIds = Array.from(
      new Set(tpm.vendors.flatMap((v) => v.languages))
    )
    const tpmVendors = languageIds.map((langId) => ({
      language_id: langId,
      vendors: vendorsByLanguage.get(langId) ?? [],
    }))

    return {
      current_time: new Date().toISOString(),
      booked_slots: [],
      booked_slots_by_language: {},
      tpm_vendors: tpmVendors,
    }
  }

  // Client shape: booked_slots grouped by language_id
  const clientShape = api as ApiCalendarDayClientShape
  const byLanguage: Record<string, BookedSlot[]> = {}
  for (const slot of clientShape.booked_slots ?? []) {
    for (const langId of slot.languages) {
      if (!byLanguage[langId]) byLanguage[langId] = []
      byLanguage[langId].push({
        start_at: slot.start_at,
        end_at: slot.end_at,
        type: 'assignment',
        assignment: null,
      })
    }
  }
  return {
    current_time: new Date().toISOString(),
    booked_slots: [],
    booked_slots_by_language: byLanguage,
  }
}

// ---- Vendor data builders ----

function vendorName(v: ApiVendorExpand): string {
  const u = v.institutionUser?.user
  return [u?.forename, u?.surname].filter(Boolean).join(' ')
}

function buildVendorWeekData(
  v: ApiVendorExpand,
  langSlots: Array<{ start_at: string; end_at: string; vendor_ids: string[] }>,
  weekStart: string
): VendorWeekData {
  const slots: VendorWeekSlot[] = []
  if (weekStart) {
    for (let day = 0; day < 7; day++) {
      for (let block = 0; block < 4; block++) {
        const blockHour = block * 6
        const matchingSlot = langSlots.find((s) => {
          const h = new Date(s.start_at).getUTCHours()
          const d = s.start_at.slice(0, 10)
          const wd = new Date(new Date(weekStart).getTime() + day * 86400000)
            .toISOString()
            .slice(0, 10)
          return d === wd && h === blockHour
        })
        const available = matchingSlot
          ? matchingSlot.vendor_ids.includes(v.id)
          : false
        const dateStr = new Date(new Date(weekStart).getTime() + day * 86400000)
          .toISOString()
          .slice(0, 10)
        const onVacation = v.emergency_schedules.some(
          (es) => dateStr >= es.start_date && dateStr <= es.end_date
        )
        const bookedHours = (v.calendar_entries ?? [])
          .filter((e) => {
            if (e.type !== 'assignment') return false
            const eDate = e.start_at.slice(0, 10)
            const eHour = new Date(e.start_at).getUTCHours()
            return (
              eDate === dateStr && eHour >= blockHour && eHour < blockHour + 6
            )
          })
          .reduce((sum, e) => {
            return (
              sum +
              (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()) /
                3600000
            )
          }, 0)
        slots.push({
          start_at: new Date(
            new Date(weekStart).getTime() + day * 86400000 + blockHour * 3600000
          ).toISOString(),
          end_at: new Date(
            new Date(weekStart).getTime() +
              day * 86400000 +
              (blockHour + 6) * 3600000
          ).toISOString(),
          available,
          ...(onVacation ? { on_vacation: true } : {}),
          ...(bookedHours > 0 ? { booked_hours: bookedHours } : {}),
        })
      }
    }
  }
  return {
    id: v.id,
    institution_user: { id: v.institutionUser?.id ?? '', name: vendorName(v) },
    is_internal: false,
    slots,
  }
}

function buildVendorMonthData(
  v: ApiVendorExpand,
  langSlots: Array<{ date: string; vendor_hours: Record<string, number> }>,
  month: string
): VendorMonthData {
  const slots: VendorMonthSlot[] = []
  if (month) {
    const start = new Date(`${month}-01`)
    const year = start.getUTCFullYear()
    const mon = start.getUTCMonth()
    const daysInMonth = new Date(year, mon + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`
      const daySlot = langSlots.find((s) => s.date === dateStr)
      const bookedHours = daySlot?.vendor_hours[v.id] ?? 0
      const available = daySlot !== undefined
      const onVacation = v.emergency_schedules.some(
        (es) => dateStr >= es.start_date && dateStr <= es.end_date
      )
      slots.push({
        date: dateStr,
        available,
        ...(bookedHours > 0 ? { booked_hours: bookedHours } : {}),
        ...(onVacation ? { on_vacation: true } : {}),
      })
    }
  }
  return {
    id: v.id,
    institution_user: { id: v.institutionUser?.id ?? '', name: vendorName(v) },
    is_internal: false,
    slots,
  }
}

// ---- Week transforms ----

function isWeekTpmShape(
  api: ApiCalendarWeekResponse
): api is ApiCalendarWeekTpmShape {
  return 'available_slots' in api && 'vendors' in api
}

function isWeekVendorShape(
  api: ApiCalendarWeekResponse
): api is ApiCalendarWeekVendorShape {
  if (!('slots' in api)) return false
  const s = (api as ApiCalendarWeekVendorShape).slots
  return Array.isArray(s) && (s.length === 0 || 'calendar_entries' in s[0])
}

export function transformWeekResponse(
  api: ApiCalendarWeekResponse,
  weekStart?: string,
  weekEnd?: string
): CalendarWeekResponse {
  const wStart = weekStart ?? ''
  const wEnd = weekEnd ?? ''

  if (isWeekTpmShape(api)) {
    const tpm = api as ApiCalendarWeekTpmShape
    const languageIds = Array.from(
      new Set(tpm.available_slots.map((s) => s.language_id))
    )
    const tpmVendors = languageIds.map((langId) => {
      const langSlots = tpm.available_slots.filter(
        (s) => s.language_id === langId
      )
      const langVendorIds = Array.from(
        new Set(langSlots.flatMap((s) => s.vendor_ids))
      )
      return {
        language_id: langId,
        vendors: tpm.vendors
          .filter((v) => langVendorIds.includes(v.id))
          .map((v) => buildVendorWeekData(v, langSlots, wStart)),
      }
    })
    return {
      current_time: new Date().toISOString(),
      week_start: wStart,
      week_end: wEnd,
      languages: languageIds.map((langId) => {
        const langSlots = tpm.available_slots.filter(
          (s) => s.language_id === langId
        )
        return {
          language_id: langId,
          total_vendors: tpm.vendors.filter((v) => v.languages.includes(langId))
            .length,
          slots: langSlots.map((s) => ({
            start_at: s.start_at,
            end_at: s.end_at,
            working_hours: 6,
            available_vendors: s.vendor_ids.length,
            my_bookings_count: 0,
          })),
        }
      }),
      tpm_vendors: tpmVendors,
    }
  }

  if (isWeekVendorShape(api)) {
    const vendor = api as ApiCalendarWeekVendorShape
    const languageIds = Array.from(
      new Set(vendor.slots.map((s) => s.language_id))
    )
    return {
      current_time: new Date().toISOString(),
      week_start: wStart,
      week_end: wEnd,
      languages: languageIds.map((langId) => ({
        language_id: langId,
        total_vendors: 0,
        slots: vendor.slots
          .filter((s) => s.language_id === langId)
          .map((s) => ({
            start_at: s.start_at,
            end_at: s.end_at,
            working_hours: 6,
            available_vendors: 0,
            my_bookings_count: s.calendar_entries.length,
          })),
      })),
    }
  }

  // Client shape
  const client = api as ApiCalendarWeekClientShape
  const languageIds = Array.from(
    new Set(client.slots.map((s) => s.language_id))
  )
  return {
    current_time: new Date().toISOString(),
    week_start: wStart,
    week_end: wEnd,
    languages: languageIds.map((langId) => ({
      language_id: langId,
      total_vendors:
        client.slots.find((s) => s.language_id === langId)?.total_vendors ?? 0,
      slots: client.slots
        .filter((s) => s.language_id === langId)
        .map((s) => ({
          start_at: s.start_at,
          end_at: s.end_at,
          working_hours: 6,
          available_vendors: s.available_vendors,
          my_bookings_count: 0,
        })),
    })),
  }
}

// ---- Month transforms ----

function isMonthTpmShape(
  api: ApiCalendarMonthResponse
): api is ApiCalendarMonthTpmShape {
  return 'available_slots' in api && 'vendors' in api
}

export function transformMonthResponse(
  api: ApiCalendarMonthResponse,
  month?: string
): CalendarMonthResponse {
  const m = month ?? ''

  if (isMonthTpmShape(api)) {
    const tpm = api as ApiCalendarMonthTpmShape
    const languageIds = Array.from(
      new Set(tpm.available_slots.map((s) => s.language_id))
    )
    const tpmVendors = languageIds.map((langId) => {
      const langSlots = tpm.available_slots.filter(
        (s) => s.language_id === langId
      )
      const langVendorIds = Array.from(
        new Set(langSlots.flatMap((s) => Object.keys(s.vendor_hours)))
      )
      return {
        language_id: langId,
        vendors: tpm.vendors
          .filter((v) => langVendorIds.includes(v.id))
          .map((v) => buildVendorMonthData(v, langSlots, m)),
      }
    })
    return {
      current_time: new Date().toISOString(),
      month: m,
      languages: languageIds.map((langId) => ({
        language_id: langId,
        total_vendors: tpm.vendors.filter((v) => v.languages.includes(langId))
          .length,
        slots: tpm.available_slots
          .filter((s) => s.language_id === langId)
          .map((s) => ({
            date: s.date,
            working_hours: 8,
            available_vendors: Object.keys(s.vendor_hours).length,
            my_bookings_count: 0,
          })),
      })),
      tpm_vendors: tpmVendors,
    }
  }

  // Vendor/Client shape
  const client = api as ApiCalendarMonthClientShape
  const languageIds = Array.from(
    new Set(client.slots.map((s) => s.language_id))
  )
  return {
    current_time: new Date().toISOString(),
    month: m,
    languages: languageIds.map((langId) => ({
      language_id: langId,
      total_vendors: 0,
      slots: client.slots
        .filter((s) => s.language_id === langId)
        .map((s) => ({
          date: s.date,
          working_hours: s.vendor_hours,
          available_vendors: 0,
          my_bookings_count: 0,
        })),
    })),
  }
}
