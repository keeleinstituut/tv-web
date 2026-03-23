import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  CalendarSearchParams,
  CalendarSearchResponse,
  CalendarOrderDetail,
  SlotMatchingVendor,
  CreateOrderPayload,
  UpdateOrderPayload,
  ApiCalendarLanguagesResponse,
  ApiCalendarDayResponse,
  ApiCalendarWeekResponse,
  ApiCalendarMonthResponse,
  ApiSlotMatchingVendor,
  ApiCalendarSearchResponse,
  ApiVendorCalendarEntry,
  transformLanguages,
  transformDayResponse,
  transformWeekResponse,
  transformMonthResponse,
} from 'types/calendar'

dayjs.extend(isoWeek)
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { useCalendarRole } from 'hooks/useCalendarRole'

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch available languages for the calendar.
 * Accepts an explicit date range; defaults to a ±2-month window around today.
 */
export const useFetchCalendarLanguages = (
  dateFrom?: string,
  dateTo?: string
) => {
  const from = dateFrom ?? dayjs().startOf('month').format('YYYY-MM-DD')
  const to = dateTo ?? dayjs().add(2, 'month').endOf('month').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-languages', from, to],
    queryFn: async () => {
      const raw: ApiCalendarLanguagesResponse = await apiClient.get(
        endpoints.CALENDAR_LANGUAGES,
        { date_from: from, date_to: to }
      )
      return transformLanguages(raw)
    },
    staleTime: Infinity,
  })
  return { isLoading, isError, languages: data?.languages ?? [] }
}

// Returns only the languages for which the current translator has assigned orders.
// Same endpoint — backend filters based on role server-side.
export const useFetchCalendarTranslatorLanguages = (
  dateFrom?: string,
  dateTo?: string
) => {
  const from = dateFrom ?? dayjs().startOf('month').format('YYYY-MM-DD')
  const to = dateTo ?? dayjs().add(2, 'month').endOf('month').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-translator-languages', from, to],
    queryFn: async () => {
      const raw: ApiCalendarLanguagesResponse = await apiClient.get(
        endpoints.CALENDAR_LANGUAGES,
        { date_from: from, date_to: to }
      )
      return transformLanguages(raw)
    },
    staleTime: Infinity,
  })
  return { isLoading, isError, languages: data?.languages ?? [] }
}

export const useFetchCalendarDay = (date: string, languageId?: string) => {
  const { isTPM } = useCalendarRole()
  const { isLoading, isError, data } = useQuery<CalendarDayResponse>({
    queryKey: ['calendar-day', date, languageId],
    queryFn: async () => {
      const raw: ApiCalendarDayResponse = await apiClient.get(
        endpoints.CALENDAR_DAY,
        { date, ...(languageId ? { language_id: languageId } : {}) }
      )
      return transformDayResponse(raw, languageId, isTPM)
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarWeek = (date: string) => {
  const dateFrom = dayjs(date).startOf('isoWeek').format('YYYY-MM-DD')
  const dateTo = dayjs(date).endOf('isoWeek').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarWeekResponse>({
    queryKey: ['calendar-week', dateFrom, dateTo],
    queryFn: async () => {
      const raw: ApiCalendarWeekResponse = await apiClient.get(
        endpoints.CALENDAR_WEEK,
        { date_from: dateFrom, date_to: dateTo }
      )
      return transformWeekResponse(raw, dateFrom, dateTo)
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarMonth = (date: string) => {
  const dateFrom = dayjs(date).startOf('month').format('YYYY-MM-DD')
  const dateTo = dayjs(date).endOf('month').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<CalendarMonthResponse>({
    queryKey: ['calendar-month', dateFrom, dateTo],
    queryFn: async () => {
      const raw: ApiCalendarMonthResponse = await apiClient.get(
        endpoints.CALENDAR_MONTH,
        { date_from: dateFrom, date_to: dateTo }
      )
      return transformMonthResponse(raw, dayjs(date).format('YYYY-MM'))
    },
    enabled: !!date,
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
      const raw: ApiCalendarWeekResponse = await apiClient.get(
        endpoints.CALENDAR_WEEK,
        { date_from: dateFrom, date_to: dateTo }
      )
      return transformWeekResponse(raw, dateFrom, dateTo)
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
  const dateFrom = dayjs(date).startOf('month').format('YYYY-MM-DD')
  const dateTo = dayjs(date).endOf('month').format('YYYY-MM-DD')

  const { isLoading, isError, data } = useQuery<
    CalendarMonthResponse,
    Error,
    CalendarMonthVendorsResponse | CalendarMonthVendorsAllResponse
  >({
    queryKey: ['calendar-month', dateFrom, dateTo],
    queryFn: async () => {
      const raw: ApiCalendarMonthResponse = await apiClient.get(
        endpoints.CALENDAR_MONTH,
        { date_from: dateFrom, date_to: dateTo }
      )
      return transformMonthResponse(raw, dayjs(date).format('YYYY-MM'))
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
 * TPM only: extract per-vendor day data from the main day response.
 * Re-uses the same query key as useFetchCalendarDay so results are shared.
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
    queryKey: ['calendar-day', date, languageId],
    queryFn: async () => {
      const raw: ApiCalendarDayResponse = await apiClient.get(
        endpoints.CALENDAR_DAY,
        { date, ...(languageId ? { language_id: languageId } : {}) }
      )
      return transformDayResponse(raw, languageId, isTPM)
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

export const useCreatePrebook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      language_id: string
      start_at: string
      end_at: string
      vendor_id?: string
    }) => apiClient.post(endpoints.CALENDAR_PREBOOK, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
    },
  })
}

export const useCancelPrebook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete(endpoints.CALENDAR_PREBOOK),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
    },
  })
}

export const useCalendarSearch = () =>
  useMutation({
    mutationFn: (params: CalendarSearchParams) =>
      apiClient
        .get(endpoints.CALENDAR_SEARCH, {
          language_id: params.language_id,
          ...(params.date_from ? { datetime: `${params.date_from}T00:00:00Z` } : {}),
          ...(params.slot_length ? { duration_minutes: params.slot_length } : {}),
        })
        .then((raw: ApiCalendarSearchResponse): CalendarSearchResponse => ({
          dates: raw.start_at ? [raw.start_at] : [],
        })),
  })

export const useFetchSlotMatching = (
  params: { start_at: string; end_at: string; language_id: string } | null
) => {
  const { isLoading, isError, data } = useQuery<SlotMatchingVendor[]>({
    queryKey: ['calendar-slot-matching', params],
    queryFn: async () => {
      const raw: ApiSlotMatchingVendor[] = await apiClient
        .get(endpoints.CALENDAR_SLOT_MATCHING, {
          language_id: params!.language_id,
          start_at: params!.start_at,
          end_at: params!.end_at,
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

export const useCreateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiClient.post(endpoints.PROJECTS, {
        is_calendar_project: true,
        destination_language_classifier_value_ids: [payload.language_id],
        event_start_at: payload.start_at,
        event_end_at: payload.end_at,
        service_type: payload.service_type,
        ...(payload.reference_number
          ? { reference_number: payload.reference_number }
          : {}),
        ...(payload.location ? { location: payload.location } : {}),
        ...(payload.meeting_link ? { meeting_link: payload.meeting_link } : {}),
        ...(payload.client_institution_id
          ? { client_institution_user_id: payload.client_institution_id }
          : {}),
        ...(payload.vendor_id ? { candidate_vendor_id: payload.vendor_id } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
    },
  })
}

export const useUpdateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) =>
      apiClient.put(`${endpoints.PROJECTS}/${payload.id}`, {
        ...(payload.service_type ? { service_type: payload.service_type } : {}),
        ...(payload.reference_number !== undefined
          ? { reference_number: payload.reference_number }
          : {}),
        ...(payload.location !== undefined ? { location: payload.location } : {}),
        ...(payload.meeting_link !== undefined
          ? { meeting_link: payload.meeting_link }
          : {}),
        ...(payload.start_at ? { event_start_at: payload.start_at } : {}),
        ...(payload.end_at ? { event_end_at: payload.end_at } : {}),
        ...(payload.vendor_id ? { candidate_vendor_id: payload.vendor_id } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-order-detail'] })
    },
  })
}

export const useCancelCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`${endpoints.PROJECTS}/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

// Accept/Decline are workflow task actions (Teostaja), not calendar-specific.
// They live in Tellimused > Minu Ülesanded and use workflow/tasks endpoints.
export const useAcceptCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) =>
      apiClient.post(`${endpoints.TASKS}/${taskId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useDeclineCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) =>
      apiClient.post(`${endpoints.TASKS}/${taskId}/decline`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useFetchCalendarOrderDetail = (id: string | null) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['calendar-order-detail', id],
    enabled: !!id,
    queryFn: () =>
      apiClient
        .get(`${endpoints.PROJECTS}/${id}`)
        .then(
          (res: { data: Record<string, unknown> }) =>
            res.data as unknown as CalendarOrderDetail
        ),
  })
  return { order: data ?? null, isLoading, isError }
}

export const useUpdatePinnedLanguages = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      institution_main_language_id,
      pin,
    }: {
      institution_main_language_id: string
      pin: boolean
    }) =>
      pin
        ? apiClient.post(endpoints.PINNED_LANGUAGES, {
            institution_main_language_id,
          })
        : apiClient.delete(endpoints.PINNED_LANGUAGES, {
            institution_main_language_id,
          }),
    onMutate: async ({ institution_main_language_id, pin }) => {
      await queryClient.cancelQueries({ queryKey: ['calendar-languages'] })
      const previous = queryClient.getQueriesData<CalendarLanguagesResponse>({
        queryKey: ['calendar-languages'],
      })
      queryClient.setQueriesData<CalendarLanguagesResponse>(
        { queryKey: ['calendar-languages'] },
        (old) =>
          old
            ? {
                languages: old.languages.map((l) => ({
                  ...l,
                  pinned:
                    l.language.institution_main_language_id ===
                    institution_main_language_id
                      ? pin
                      : l.pinned,
                })),
              }
            : old
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-languages'] })
    },
  })
}

// ---------------------------------------------------------------------------
// New hooks (Step 10)
// ---------------------------------------------------------------------------

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

export const useCreateEmergencySchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      start_date,
      end_date,
    }: {
      vendorId: string
      start_date: string
      end_date: string
    }) =>
      apiClient.post(endpoints.VENDOR_EMERGENCY_SCHEDULES(vendorId), {
        start_date,
        end_date,
      }),
    onSuccess: (_data, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-schedules', vendorId] })
    },
  })
}

export const useDeleteEmergencySchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      vendorId,
      scheduleId,
    }: {
      vendorId: string
      scheduleId: string
    }) =>
      apiClient.delete(
        endpoints.VENDOR_EMERGENCY_SCHEDULE(vendorId, scheduleId)
      ),
    onSuccess: (_data, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-schedules', vendorId] })
    },
  })
}

// ---------------------------------------------------------------------------
// Stub hooks (endpoints not yet available in backend)
// ---------------------------------------------------------------------------

export const useFetchWeekSlotBookings = (
  params: { start_at: string; end_at: string; language_id: string } | null
) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['calendar-week-slot-bookings', params],
    queryFn: async () => {
      const entries: ApiVendorCalendarEntry[] = await apiClient
        .get(endpoints.CALENDAR_VENDOR_ENTRIES, {
          date_from: params!.start_at.slice(0, 10),
          date_to: params!.end_at.slice(0, 10),
          assignments_only: true,
        })
        .then((res: { data: ApiVendorCalendarEntry[] }) => res.data)
      return entries
        .filter(
          (e) =>
            e.type === 'assignment' &&
            e.assignment != null &&
            e.start_at >= params!.start_at &&
            e.start_at < params!.end_at
        )
        .map((e) => ({
          id: e.assignment!.id,
          ext_id: e.assignment!.ext_id,
        }))
    },
    enabled: !!params,
  })
  return { isLoading, isError, bookings: data ?? [] }
}

// ---------------------------------------------------------------------------
// Type re-exports for convenience
// ---------------------------------------------------------------------------

export type { SlotMatchingVendor } from 'types/calendar'
