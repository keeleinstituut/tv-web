import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
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
  ApiCalendarLanguagesResponse,
  ApiCalendarWeekResponse,
  ApiCalendarMonthResponse,
  ApiSlotMatchingVendor,
  SlotMatchingVendor,
  transformLanguages,
  transformDayResponse,
  transformWeekResponse,
  transformMonthResponse,
} from 'types/calendar'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { toCalendarApiDateTime } from 'helpers/calendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  transformProjectDetail,
  unwrapCalendarProjectPayload,
} from './calendarOrderDetailTransform'

dayjs.extend(isoWeek)

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useFetchCalendarLanguages = (
  dateFrom?: string,
  dateTo?: string
) => {
  const from = dateFrom ?? dayjs().format('YYYY-MM-DD')
  const to = dateTo ?? from
  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-languages', from, to],
    queryFn: async () => {
      const res: { data: ApiCalendarLanguagesResponse } = await apiClient.get(
        endpoints.CALENDAR_LANGUAGES,
        { date_from: from, date_to: to }
      )
      return transformLanguages(res.data)
    },
    staleTime: Infinity,
  })
  return { isLoading, isError, languages: data?.languages ?? [] }
}

export const useFetchCalendarDay = (date: string) => {
  const { isTPM } = useCalendarRole()
  const { isLoading, isError, data } = useQuery<CalendarDayResponse>({
    queryKey: ['calendar-day', date],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_DAY, { date })
      return transformDayResponse(res.data, isTPM)
    },
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarWeek = (date: string) => {
  const dateFrom = dayjs(date).startOf('isoWeek').format('YYYY-MM-DD')
  const dateTo = dayjs(date).endOf('isoWeek').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarWeekResponse>({
    queryKey: ['calendar-week', dateFrom, dateTo],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_WEEK, {
        date_from: dateFrom,
        date_to: dateTo,
      })
      return transformWeekResponse(
        res.data as ApiCalendarWeekResponse,
        dateFrom,
        dateTo
      )
    },
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  })
  return { isLoading, isError, data }
}

function mondayOf(d: dayjs.Dayjs) {
  const day = d.day()
  return d.add(day === 0 ? -6 : 1 - day, 'day')
}

export const useFetchCalendarMonth = (date: string) => {
  const firstVisibleDay = mondayOf(dayjs(date).startOf('month'))
  const lastDay = dayjs(date).endOf('month')
  const lastVisibleDay = mondayOf(lastDay).add(6, 'day')
  const dateFrom = firstVisibleDay.format('YYYY-MM-DD')
  const dateTo = lastVisibleDay.format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarMonthResponse>({
    queryKey: ['calendar-month', dateFrom, dateTo],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_MONTH, {
        date_from: dateFrom,
        date_to: dateTo,
      })
      return transformMonthResponse(
        res.data as ApiCalendarMonthResponse,
        dayjs(date).format('YYYY-MM')
      )
    },
    enabled: !!date,
    staleTime: 2 * 60 * 1000,
  })
  return { isLoading, isError, data }
}

/**
 * TPM only: extract per-vendor week data. Re-uses the same query key as
 * useFetchCalendarWeek so results are shared from cache.
 */
export const useFetchCalendarWeekVendors = (
  date: string,
  languageId?: string
) => {
  const dateFrom = dayjs(date).startOf('isoWeek').format('YYYY-MM-DD')
  const dateTo = dayjs(date).endOf('isoWeek').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<
    CalendarWeekResponse,
    Error,
    CalendarWeekVendorsResponse | CalendarWeekVendorsAllResponse
  >({
    queryKey: ['calendar-week', dateFrom, dateTo],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_WEEK, {
        date_from: dateFrom,
        date_to: dateTo,
      })
      return transformWeekResponse(
        res.data as ApiCalendarWeekResponse,
        dateFrom,
        dateTo
      )
    },
    select: (
      weekData
    ): CalendarWeekVendorsResponse | CalendarWeekVendorsAllResponse => {
      const tpmVendors = weekData.tpm_vendors ?? []
      if (languageId) {
        const langData = tpmVendors.find((l) => l.language_id === languageId)
        return {
          language_id: languageId,
          week_start: weekData.week_start,
          week_end: weekData.week_end,
          vendors: langData?.vendors ?? [],
        }
      }
      return { languages: tpmVendors }
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

/**
 * TPM only: extract per-vendor month data. Re-uses the same query key as
 * useFetchCalendarMonth so results are shared from cache.
 */
export const useFetchCalendarMonthVendors = (
  date: string,
  languageId?: string
) => {
  const firstVisibleDay = mondayOf(dayjs(date).startOf('month'))
  const lastVisibleDay = mondayOf(dayjs(date).endOf('month')).add(6, 'day')
  const dateFrom = firstVisibleDay.format('YYYY-MM-DD')
  const dateTo = lastVisibleDay.format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<
    CalendarMonthResponse,
    Error,
    CalendarMonthVendorsResponse | CalendarMonthVendorsAllResponse
  >({
    queryKey: ['calendar-month', dateFrom, dateTo],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_MONTH, {
        date_from: dateFrom,
        date_to: dateTo,
      })
      return transformMonthResponse(
        res.data as ApiCalendarMonthResponse,
        dayjs(date).format('YYYY-MM')
      )
    },
    select: (
      monthData
    ): CalendarMonthVendorsResponse | CalendarMonthVendorsAllResponse => {
      const tpmVendors = monthData.tpm_vendors ?? []
      if (languageId) {
        const langData = tpmVendors.find((l) => l.language_id === languageId)
        return {
          language_id: languageId,
          month: monthData.month,
          vendors: langData?.vendors ?? [],
        }
      }
      return { languages: tpmVendors }
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

/**
 * TPM only: extract per-vendor day data. Re-uses the same query key as
 * useFetchCalendarDay so results are shared from cache — no extra request.
 */
export const useFetchCalendarDayVendors = (
  date: string,
  languageId?: string
) => {
  const { isTPM } = useCalendarRole()
  const { isLoading, isError, data } = useQuery<
    CalendarDayResponse,
    Error,
    CalendarDayVendorsResponse | CalendarDayVendorsAllResponse
  >({
    queryKey: ['calendar-day', date],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.CALENDAR_DAY, { date })
      return transformDayResponse(res.data, isTPM)
    },
    select: (
      dayData
    ): CalendarDayVendorsResponse | CalendarDayVendorsAllResponse => {
      const tpmVendors = dayData.tpm_vendors ?? []
      if (languageId) {
        const langData = tpmVendors.find((l) => l.language_id === languageId)
        return { language_id: languageId, vendors: langData?.vendors ?? [] }
      }
      return { languages: tpmVendors }
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchSlotMatching = (
  params: { start_at: string; end_at: string; language_id: string } | null
) => {
  const { isLoading, isError, data } = useQuery<SlotMatchingVendor[]>({
    queryKey: ['calendar-slot-matching', params],
    queryFn: async () => {
      const raw: ApiSlotMatchingVendor[] = await apiClient
        .get(endpoints.CALENDAR_SLOT_MATCHING, {
          language_id: params!.language_id,
          start_at: toCalendarApiDateTime(params!.start_at),
          end_at: toCalendarApiDateTime(params!.end_at),
        })
        .then((res: { data: ApiSlotMatchingVendor[] }) => res.data)
      return raw.map((v) => ({
        id: v.id,
        institution_user_id: v.institution_user_id,
        name: v.name,
        is_internal: v.is_internal,
      }))
    },
    enabled: !!params,
  })
  return { isLoading, isError, vendors: data ?? [] }
}

export const useFetchCalendarTags = () => {
  const { data } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['calendar-tags'],
    queryFn: async () => {
      const res: { data: Array<{ id: string; name: string }> } =
        await apiClient.get(endpoints.TAGS, {
          'type[]': ['Tellimus', 'Valdkond'],
        })
      return res.data ?? []
    },
    staleTime: Infinity,
  })
  return { tags: data ?? [] }
}

export const useFetchCalendarOrderDetail = (id: string | null) => {
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ['calendar-order-detail', id],
    enabled: !!id,
    queryFn: () =>
      apiClient
        .get(`${endpoints.PROJECTS}/${id}`)
        .then((res) =>
          transformProjectDetail(unwrapCalendarProjectPayload(res))
        ),
  })
  return {
    order: data ?? null,
    isLoading,
    isFetching,
    isError,
  }
}

export const useFetchVendorCalendarEntries = (params: {
  date_from: string
  date_to: string
  assignments_only?: boolean
}) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['vendor-calendar-entries', params.date_from, params.date_to],
    queryFn: () =>
      apiClient
        .get(endpoints.CALENDAR_VENDOR_ENTRIES, params)
        .then((res: { data: unknown[] }) => res.data),
    enabled: !!params.date_from && !!params.date_to,
  })
  return { isLoading, isError, entries: data ?? [] }
}

export const useFetchVendorCalendar = (
  vendorId: string | null,
  dateFrom: string,
  dateTo: string
) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['vendor-calendar', vendorId, dateFrom, dateTo],
    queryFn: () =>
      apiClient
        .get(endpoints.VENDOR_CALENDAR(vendorId!), {
          date_from: dateFrom,
          date_to: dateTo,
        })
        .then((res: { data: unknown[] }) => res.data),
    enabled: !!vendorId && !!dateFrom && !!dateTo,
  })
  return { isLoading, isError, days: data ?? [] }
}

export const useFetchEmergencySchedules = (vendorId: string | null) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['emergency-schedules', vendorId],
    queryFn: () =>
      apiClient
        .get(endpoints.VENDOR_EMERGENCY_SCHEDULES(vendorId!))
        .then((res: { data: unknown[] }) => res.data),
    enabled: !!vendorId,
  })
  return { isLoading, isError, schedules: data ?? [] }
}
