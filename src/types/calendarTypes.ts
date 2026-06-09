export type CalendarView = 'day' | 'week' | 'month'

export type CalendarProjectStatus =
  | 'NEW'
  | 'REGISTERED'
  | 'IN_PROGRESS'
  | 'CANCELLED'
  | 'SUBMITTED_TO_CLIENT'
  | 'REJECTED'
  | 'CORRECTED'
  | 'ACCEPTED'

/** Sub-project (language leg) status — drives calendar label while project is NEW/REGISTERED. */
export type CalendarSubProjectStatus =
  | 'REGISTERED'
  | 'CANCELLED'
  | 'TASKS_SUBMITTED_TO_VENDORS'
  | 'TASKS_IN_PROGRESS'
  | 'TASKS_COMPLETED'
  | 'COMPLETED'

/** Assignment row status (Teostaja task), distinct from project / sub-project. */
export type BookedSlotAssignmentWorkflowStatus = 'NEW' | 'IN_PROGRESS' | 'DONE'

export type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

export type SlotType =
  | 'assignment'
  | 'external_calendar'
  | 'vacation'
  | 'prebook'
  | 'absence'

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
  vendor_id?: string
  confirmed?: boolean
  /** Task / assignment workflow (calendar entry), not project status. */
  status?: BookedSlotAssignmentWorkflowStatus
  /** Parent project status from API (when embedded on calendar entry). */
  project_status?: CalendarProjectStatus
  sub_project: {
    id: string
    ext_id: string
    source_language: { id: string; value: string; name: string }
    destination_language: { id: string; value: string; name: string }
    status?: CalendarSubProjectStatus
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
  /** Client role: time ranges with available vendors, grouped by language_id */
  available_slots_by_language?: Record<
    string,
    Array<{ start_at: string; end_at: string }>
  >
}

// --- Week view ---

export interface WeekSlot {
  start_at: string
  end_at: string
  working_hours: number
  available_vendors: number
  my_bookings_count: number
  /** Translator week: assignment entries for this 6h slot (from week API). */
  my_bookings?: BookedSlot[]
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
  is_emo: boolean
  booked_slots: BookedSlot[]
  available_slots: Array<{ start_at: string; end_at: string }>
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
  is_emo: boolean
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
  is_emo: boolean
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
  status: CalendarProjectStatus
  /** First sub-project status — used with project NEW/REGISTERED for display. */
  sub_project_status?: CalendarSubProjectStatus
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
  vendor?: { id?: string; name: string; email: string; phone: string }
  tags?: Array<{ id: string; name: string; type?: string }>
  source_files?: Array<{
    id: string
    name: string
    file_name: string
    size: number
    /** From API `collection_name` — used for media download/delete. */
    collection_name?: 'help' | 'source' | 'final'
  }>
  files_count: number
  files_accessible: boolean
  project_comments?: Array<{
    id: string
    institution_user_id: string
    comment: string
    created_at: string
    institution_user?: {
      id: string
      user?: { forename?: string; surname?: string }
    } | null
  }>
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
  /** Calendar attachments — sent as `help_files[]` on POST /projects (multipart). */
  help_files?: File[]
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
  name: string
  is_internal: boolean
  is_emo: boolean
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
  type: 'assignment' | 'prebook' | 'external_calendar' | 'vacation' | 'absence'
  assignment_id: string | null
  assignment?: ApiAssignmentSummary | null
}

export interface ApiAssignmentSummary {
  id: string
  ext_id: string
  sub_project_id?: string
  event_start_at?: string
  deadline_at?: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  subProject?: {
    id: string
    ext_id: string
    project_id?: string
    destination_language_classifier_value_id?: string
    status?: string
    project?: {
      id: string
      ext_id: string
      status?: CalendarProjectStatus
      service_type?: 'REMOTE' | 'ON_SITE'
      location?: string
      meeting_link?: string
      reference_number?: string
      event_start_at?: string
      event_end_at?: string
      client_institution_user?: {
        id: string
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
        institution?: { name?: string }
      }
      manager_institution_user?: {
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
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
  is_internal: boolean
  emergency_schedules: { id: string; start_date: string; end_date: string }[]
  institution_user: {
    user: {
      forename: string
      surname: string
    }
  }
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
