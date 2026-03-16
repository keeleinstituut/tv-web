export type CalendarView = 'day' | 'week' | 'month'

export type SlotType =
  | 'assignment'
  | 'external_calendar'
  | 'vacation'
  | 'prebook'

export interface CalendarLanguage {
  language: {
    id: string
    type: string
    value: string
    name: string
    meta: { iso3_code: string }
  }
  pinned: boolean
}

export interface CalendarLanguagesResponse {
  languages: CalendarLanguage[]
}

// --- Day view ---

export interface BookedSlotAssignment {
  id: string
  confirmed?: boolean
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

// --- Summary ---

export interface CalendarSummaryResponse {
  month: string
  summary: Array<{
    language: { id: string; value: string; name: string }
    accepted_projects_count: number
    total_duration_minutes: number
  }>
  total: {
    accepted_projects_count: number
    total_duration_minutes: number
  }
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
