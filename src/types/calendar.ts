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
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  sub_project: {
    id: string
    ext_id: string
    source_language: { id: string; value: string; name: string }
    destination_language: { id: string; value: string; name: string }
  }
  // Teostaja panel detail fields (populated by backend, mocked for now)
  service_type?: 'remote' | 'on-site'
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
  booked_slots: BookedSlot[]
  /** Populated only for TPM role — vendor-level breakdown per language */
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  language: { id: string; value: string; name: string }
  start_at: string
  end_at: string
  service_type: 'remote' | 'on-site'
  location?: string
  meeting_link?: string
  domain?: string
  reference_number?: string
  created_at: string
  updated_at?: string
  accepted_at?: string
  cancelled_at?: string
  completed_at?: string
  client?: { name: string; institution: string; email: string; phone: string }
  coordinator?: { name: string; email: string; phone: string }
  files_count: number
  files_accessible: boolean
  comments: Array<{ author: string; role: string; text: string; created_at: string }>
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
  date_from: string
  date_to: string
  slot_length: number
  start_time?: string
  end_time?: string
}

export interface CalendarSearchResponse {
  dates: string[]
}

// --- Create order ---

export interface CreateOrderPayload {
  language_id: string
  start_at: string
  end_at: string
  service_type: 'remote' | 'on-site'
  reference_number?: string
  location?: string
  meeting_link?: string
  client_institution_id?: string
  domain_id?: string
  vendor_id?: string
}

// --- Update order ---

export interface UpdateOrderPayload {
  id: string
  service_type?: 'remote' | 'on-site'
  reference_number?: string
  location?: string
  meeting_link?: string
  client_institution_id?: string
  start_at?: string
  end_at?: string
  domain_id?: string
  vendor_id?: string
}

// --- Slot matching ---

export interface SlotMatchingVendor {
  id: string
  institution_user: { id: string; name: string }
  is_internal: boolean
}

export interface CalendarSlotMatchingResponse {
  vendors: SlotMatchingVendor[]
}

// ---------------------------------------------------------------------------
// Raw API response types (backend shapes before transformation)
// ---------------------------------------------------------------------------

export interface ApiLanguageItem {
  id: string
  institution_main_language_id: string
  type: string
  value: string
  name: string
  meta?: { iso3_code: string }
  is_rare?: boolean
}

export interface ApiCalendarLanguagesResponse {
  main_languages: ApiLanguageItem[]
  pinned_languages: Array<{ institution_main_language_id: string }>
  project_languages: ApiLanguageItem[]
}

// Day response is role-specific — backend determines shape
export interface ApiCalendarDayVendorShape {
  current_time: string
  booked_slots: BookedSlot[]
}

export interface ApiCalendarDayClientShape {
  current_time: string
  languages: Array<{
    language_id: string
    working_hours: number
    available_vendors: number
  }>
}

export interface ApiCalendarDayVendorEntry {
  id: string
  institution_user: { id: string; name: string }
  is_internal: boolean
  booked_slots: BookedSlot[]
}

export interface ApiCalendarDayTpmShape {
  current_time: string
  languages: Array<{
    language_id: string
    vendors: ApiCalendarDayVendorEntry[]
  }>
}

export type ApiCalendarDayResponse =
  | ApiCalendarDayVendorShape
  | ApiCalendarDayClientShape
  | ApiCalendarDayTpmShape

export interface ApiCalendarWeekResponse {
  current_time: string
  week_start: string
  week_end: string
  languages: Array<{
    language_id: string
    total_vendors: number
    slots: Array<{
      start_at: string
      end_at: string
      working_hours: number
      available_vendors: number
      my_bookings_count?: number
    }>
  }>
}

export interface ApiCalendarMonthResponse {
  current_time: string
  month: string
  languages: Array<{
    language_id: string
    total_vendors: number
    slots: Array<{
      date: string
      working_hours?: number
      vendor_hours?: number
      available_vendors?: number
      my_bookings_count?: number
    }>
  }>
}

// ---------------------------------------------------------------------------
// Transform functions
// ---------------------------------------------------------------------------

export function transformLanguages(
  api: ApiCalendarLanguagesResponse
): CalendarLanguagesResponse {
  const pinnedIds = new Set(
    api.pinned_languages.map((p) => p.institution_main_language_id)
  )
  const allLanguages = [
    ...(api.main_languages ?? []),
    ...(api.project_languages ?? []),
  ]
  const seen = new Set<string>()
  const languages: CalendarLanguage[] = []
  for (const lang of allLanguages) {
    if (seen.has(lang.id)) continue
    seen.add(lang.id)
    languages.push({
      language: {
        id: lang.id,
        institution_main_language_id: lang.institution_main_language_id,
        type: lang.type ?? 'LANGUAGE',
        value: lang.value,
        name: lang.name,
        meta: lang.meta ?? { iso3_code: '' },
      },
      pinned: pinnedIds.has(lang.institution_main_language_id),
      is_rare: lang.is_rare,
    })
  }
  return { languages }
}

function isVendorDayShape(
  api: ApiCalendarDayResponse
): api is ApiCalendarDayVendorShape {
  return 'booked_slots' in api
}

function isTpmDayShape(
  api: ApiCalendarDayResponse,
  isTPM?: boolean
): api is ApiCalendarDayTpmShape {
  if (!('languages' in api)) return false
  const langs = (api as ApiCalendarDayTpmShape).languages
  if (!Array.isArray(langs)) return false
  // Empty array: can't inspect items — fall back to the role hint
  if (langs.length === 0) return isTPM === true
  return 'vendors' in langs[0]
}

export function transformDayResponse(
  api: ApiCalendarDayResponse,
  languageId?: string,
  isTPM?: boolean
): CalendarDayResponse {
  if (isVendorDayShape(api)) {
    return api
  }
  if (isTpmDayShape(api, isTPM)) {
    const tpm = api as ApiCalendarDayTpmShape
    const langData = languageId
      ? tpm.languages.find((l) => l.language_id === languageId)
      : null
    return {
      current_time: api.current_time,
      booked_slots: langData
        ? langData.vendors.flatMap((v) => v.booked_slots)
        : [],
      tpm_vendors: tpm.languages.map((l) => ({
        language_id: l.language_id,
        vendors: l.vendors,
      })),
    }
  }
  // Client shape — no individual slot data at language level
  return {
    current_time: api.current_time,
    booked_slots: [],
  }
}

export function transformWeekResponse(
  api: ApiCalendarWeekResponse
): CalendarWeekResponse {
  return {
    current_time: api.current_time,
    week_start: api.week_start,
    week_end: api.week_end,
    languages: api.languages.map((lang) => ({
      language_id: lang.language_id,
      total_vendors: lang.total_vendors,
      slots: lang.slots.map((slot) => ({
        start_at: slot.start_at,
        end_at: slot.end_at,
        working_hours: slot.working_hours,
        available_vendors: slot.available_vendors,
        my_bookings_count: slot.my_bookings_count ?? 0,
      })),
    })),
  }
}

export function transformMonthResponse(
  api: ApiCalendarMonthResponse
): CalendarMonthResponse {
  return {
    current_time: api.current_time,
    month: api.month,
    languages: api.languages.map((lang) => ({
      language_id: lang.language_id,
      total_vendors: lang.total_vendors,
      slots: lang.slots.map((slot) => ({
        date: slot.date,
        working_hours: slot.working_hours ?? 0,
        available_vendors: slot.available_vendors ?? 0,
        my_bookings_count: slot.my_bookings_count ?? 0,
      })),
    })),
  }
}
