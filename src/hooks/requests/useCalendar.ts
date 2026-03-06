import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import {
  CalendarLanguagesResponse,
  CalendarDayResponse,
  CalendarWeekResponse,
  CalendarMonthResponse,
  CalendarDayVendorsResponse,
  CalendarDayVendorsAllResponse,
  CalendarWeekVendorsResponse,
  CalendarWeekVendorsAllResponse,
  CalendarMonthVendorsResponse,
  CalendarMonthVendorsAllResponse,
  CalendarSearchParams,
  CalendarSearchResponse,
  CalendarSummaryResponse,
  CalendarSlotMatchingResponse,
} from 'types/calendar'

// ---------------------------------------------------------------------------
// Mock data — replace with apiClient calls once backend is ready
// ---------------------------------------------------------------------------

const MOCK_LANGUAGES: CalendarLanguagesResponse = {
  languages: [
    {
      language: { id: 'lang-ru', type: 'LANGUAGE', value: 'ru', name: 'Vene keel', meta: { iso3_code: 'rus' } },
      pinned: true,
    },
    {
      language: { id: 'lang-en', type: 'LANGUAGE', value: 'en', name: 'Inglise keel', meta: { iso3_code: 'eng' } },
      pinned: true,
    },
    {
      language: { id: 'lang-de', type: 'LANGUAGE', value: 'de', name: 'Saksa keel', meta: { iso3_code: 'deu' } },
      pinned: false,
    },
    {
      language: { id: 'lang-fi', type: 'LANGUAGE', value: 'fi', name: 'Soome keel', meta: { iso3_code: 'fin' } },
      pinned: false,
    },
  ],
}

const MOCK_VENDORS = [
  { id: 'v1', institution_user: { id: 'u1', name: 'Anna Bergmann' }, is_internal: true },
  { id: 'v2', institution_user: { id: 'u2', name: 'Boris Dmitrov' }, is_internal: true },
  { id: 'v3', institution_user: { id: 'u3', name: 'Fiona Hall' }, is_internal: false },
  { id: 'v4', institution_user: { id: 'u4', name: 'Karl Liiv' }, is_internal: true },
  { id: 'v5', institution_user: { id: 'u5', name: 'Mari Vaher' }, is_internal: false },
  { id: 'v6', institution_user: { id: 'u6', name: 'Mati Tamm' }, is_internal: true },
  { id: 'v7', institution_user: { id: 'u7', name: 'Raili Lepp' }, is_internal: false },
]

import dayjs from 'dayjs'

const TODAY = dayjs().format('YYYY-MM-DD')

// Deterministic pseudo-random based on a numeric seed
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// Build ISO string in local timezone for the given date + hour + minute
const localIso = (date: string, hour: number, minute = 0) =>
  dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toISOString()

const mockDayResponse = (date: string, languageId?: string): CalendarDayResponse => {
  if (date !== TODAY) return { current_time: new Date().toISOString(), booked_slots: [] }

  const slots = [
    {
      start_at: localIso(date, 9, 0),
      end_at: localIso(date, 10, 30),
      type: 'assignment' as const,
      assignment: {
        id: 'asgn-1',
        sub_project: {
          id: 'sp-1',
          ext_id: 'OR-2024-001',
          source_language: { id: 'lang-et', value: 'et', name: 'Eesti keel' },
          destination_language: { id: 'lang-ru', value: 'ru', name: 'Vene keel' },
        },
      },
    },
  ]

  // External calendar event only for the 'ru' language row
  if (languageId === 'lang-ru') {
    slots.push({
      start_at: localIso(date, 13, 0),
      end_at: localIso(date, 13, 30),
      type: 'external_calendar' as const,
      assignment: null,
      meta: 'Meeskonna koosolek',
    })
  }

  return { current_time: new Date().toISOString(), booked_slots: slots }
}

const mockWeekResponse = (date: string): CalendarWeekResponse => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay() + 1 + i)
    return d.toISOString().split('T')[0]
  })
  const blocks = ['00:00', '06:00', '12:00', '18:00']
  return {
    current_time: new Date().toISOString(),
    week_start: days[0],
    week_end: days[6],
    languages: MOCK_LANGUAGES.languages.map((l) => ({
      language_id: l.language.id,
      total_vendors: 7,
      slots: days.flatMap((day) =>
        blocks.map((block, bi) => {
          const seed = i * 100 + bi
          return {
            start_at: `${day}T${block}:00Z`,
            end_at: `${day}T${blocks[(bi + 1) % 4] || '24:00'}:00Z`,
            working_hours: bi === 1 || bi === 2 ? 6 : 0,
            available_vendors: bi === 1 || bi === 2 ? Math.floor(seededRandom(seed) * 7) : 0,
            my_bookings_count: bi === 1 ? (seededRandom(seed + 50) > 0.8 ? 1 : 0) : 0,
          }
        })
      ),
    })),
  }
}

const mockMonthResponse = (date: string): CalendarMonthResponse => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(year, month, i + 1)
    return day.toISOString().split('T')[0]
  })
  return {
    current_time: new Date().toISOString(),
    month: `${year}-${String(month + 1).padStart(2, '0')}`,
    languages: MOCK_LANGUAGES.languages.map((l) => ({
      language_id: l.language.id,
      total_vendors: 7,
      slots: days.map((day) => {
        const dow = new Date(day).getDay()
        const isWeekend = dow === 0 || dow === 6
        return {
          date: day,
          working_hours: isWeekend ? 0 : 8,
          available_vendors: isWeekend ? 0 : Math.floor(seededRandom(i * 17) * 7),
          my_bookings_count: !isWeekend && seededRandom(i * 17 + 50) > 0.8 ? 1 : 0,
        }
      }),
    })),
  }
}

const mockDayVendors = (date: string, languageId: string): CalendarDayVendorsResponse => ({
  language_id: languageId,
  vendors: MOCK_VENDORS.map((v, vi) => ({
    ...v,
    booked_slots:
      seededRandom(vi * 13) > 0.5
        ? [
            {
              start_at: `${date}T09:00:00Z`,
              end_at: `${date}T10:30:00Z`,
              type: 'assignment' as const,
              assignment: null,
            },
          ]
        : [],
  })),
})

const mockWeekVendors = (date: string, languageId: string): CalendarWeekVendorsResponse => {
  const d = new Date(date)
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return day.toISOString().split('T')[0]
  })
  const blocks = ['00:00', '06:00', '12:00', '18:00']
  return {
    language_id: languageId,
    week_start: days[0],
    week_end: days[6],
    vendors: MOCK_VENDORS.map((v, vi) => ({
      ...v,
      slots: days.flatMap((day, di) =>
        blocks.map((block, bi) => ({
          start_at: `${day}T${block}:00Z`,
          end_at: `${day}T${blocks[(bi + 1) % 4] || '24:00'}:00Z`,
          // First vendor (AB) is fully booked all day every day
          available: vi === 0 ? false : bi === 1 || bi === 2 ? seededRandom(vi * 31 + di * 7 + bi) > 0.3 : false,
          booked_hours: vi === 0 ? 6 : undefined,
        }))
      ),
    })),
  }
}

const mockMonthVendors = (date: string, languageId: string): CalendarMonthVendorsResponse => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(year, month, i + 1)
    return day.toISOString().split('T')[0]
  })
  return {
    language_id: languageId,
    month: `${year}-${String(month + 1).padStart(2, '0')}`,
    vendors: MOCK_VENDORS.map((v) => ({
      ...v,
      slots: days.map((day) => {
        const dow = new Date(day).getDay()
        const isWeekend = dow === 0 || dow === 6
        return {
          date: day,
          available: !isWeekend && Math.random() > 0.3,
          booked_hours: !isWeekend ? Math.floor(Math.random() * 8) : undefined,
        }
      }),
    })),
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useFetchCalendarLanguages = (timeframe?: string) => {
  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-languages', timeframe],
    queryFn: () => Promise.resolve(MOCK_LANGUAGES),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_LANGUAGES, { timeframe }),
    staleTime: Infinity,
  })
  return { isLoading, isError, languages: data?.languages ?? [] }
}

export const useFetchCalendarDay = (date: string, languageId?: string) => {
  const { isLoading, isError, data } = useQuery<CalendarDayResponse>({
    queryKey: ['calendar-day', date, languageId],
    queryFn: () => Promise.resolve(mockDayResponse(date, languageId)),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_DAY, { date, language_id: languageId }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarWeek = (date: string) => {
  const { isLoading, isError, data } = useQuery<CalendarWeekResponse>({
    queryKey: ['calendar-week', date],
    queryFn: () => Promise.resolve(mockWeekResponse(date)),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_WEEK, { date }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarMonth = (date: string) => {
  const { isLoading, isError, data } = useQuery<CalendarMonthResponse>({
    queryKey: ['calendar-month', date],
    queryFn: () => Promise.resolve(mockMonthResponse(date)),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_MONTH, { date }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarDayVendors = (date: string, languageId?: string) => {
  const { isLoading, isError, data } = useQuery<
    CalendarDayVendorsResponse | CalendarDayVendorsAllResponse
  >({
    queryKey: ['calendar-day-vendors', date, languageId],
    queryFn: () =>
      languageId
        ? Promise.resolve(mockDayVendors(date, languageId))
        : Promise.resolve({
            languages: MOCK_LANGUAGES.languages.map((l) => mockDayVendors(date, l.language.id)),
          } as CalendarDayVendorsAllResponse),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_DAY_VENDORS, { date, language_id: languageId }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarWeekVendors = (date: string, languageId?: string) => {
  const { isLoading, isError, data } = useQuery<
    CalendarWeekVendorsResponse | CalendarWeekVendorsAllResponse
  >({
    queryKey: ['calendar-week-vendors', date, languageId],
    queryFn: () =>
      languageId
        ? Promise.resolve(mockWeekVendors(date, languageId))
        : Promise.resolve({
            languages: MOCK_LANGUAGES.languages.map((l) => mockWeekVendors(date, l.language.id)),
          } as CalendarWeekVendorsAllResponse),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_WEEK_VENDORS, { date, language_id: languageId }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarMonthVendors = (date: string, languageId?: string) => {
  const { isLoading, isError, data } = useQuery<
    CalendarMonthVendorsResponse | CalendarMonthVendorsAllResponse
  >({
    queryKey: ['calendar-month-vendors', date, languageId],
    queryFn: () =>
      languageId
        ? Promise.resolve(mockMonthVendors(date, languageId))
        : Promise.resolve({
            languages: MOCK_LANGUAGES.languages.map((l) => mockMonthVendors(date, l.language.id)),
          } as CalendarMonthVendorsAllResponse),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_MONTH_VENDORS, { date, language_id: languageId }),
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarSearch = (params: CalendarSearchParams | null) => {
  const { isLoading, isError, data } = useQuery<CalendarSearchResponse>({
    queryKey: ['calendar-search', params],
    queryFn: () => Promise.resolve({ dates: ['2026-03-06', '2026-03-09', '2026-03-10'] }),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_SEARCH, params ?? {}),
    enabled: !!params,
  })
  return { isLoading, isError, dates: data?.dates ?? [] }
}

export const useFetchCalendarSummary = (month: string) => {
  const { isLoading, isError, data } = useQuery<CalendarSummaryResponse>({
    queryKey: ['calendar-summary', month],
    queryFn: () =>
      Promise.resolve({
        month,
        summary: MOCK_LANGUAGES.languages.map((l) => ({
          language: { id: l.language.id, value: l.language.value, name: l.language.name },
          accepted_projects_count: Math.floor(Math.random() * 20),
          total_duration_minutes: Math.floor(Math.random() * 1440),
        })),
        total: { accepted_projects_count: 47, total_duration_minutes: 2880 },
      }),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_SUMMARY, { month }),
    enabled: !!month,
  })
  return { isLoading, isError, data }
}

export const useFetchSlotMatching = (
  params: { start_at: string; end_at: string; language_id: string } | null
) => {
  const { isLoading, isError, data } = useQuery<CalendarSlotMatchingResponse>({
    queryKey: ['calendar-slot-matching', params],
    queryFn: () => Promise.resolve({ vendors: MOCK_VENDORS }),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_SLOT_MATCHING, params ?? {}),
    enabled: !!params,
  })
  return { isLoading, isError, vendors: data?.vendors ?? [] }
}

export const useUpdatePinnedLanguages = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (_languageIds: string[]) => Promise.resolve(),
    // mutationFn: (language_ids: string[]) => apiClient.post(endpoints.PINNED_LANGUAGES, { language_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-languages'])
    },
  })
}
