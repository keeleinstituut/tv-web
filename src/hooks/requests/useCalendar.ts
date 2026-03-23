import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  CalendarSlotMatchingResponse,
  WeekSlotBookingsResponse,
  CalendarOrderDetail,
  CreateOrderPayload,
  UpdateOrderPayload,
  ApiCalendarLanguagesResponse,
  ApiCalendarDayResponse,
  ApiCalendarWeekResponse,
  ApiCalendarMonthResponse,
  transformLanguages,
  transformDayResponse,
  transformWeekResponse,
  transformMonthResponse,
} from 'types/calendar'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  MOCK_LANGUAGES,
  MOCK_VENDORS,
  mockWeekVendors,
  mockMonthVendors,
} from './calendarMocks'

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useFetchCalendarLanguages = (timeframe?: string) => {
  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-languages', timeframe],
    queryFn: async () => {
      const raw: ApiCalendarLanguagesResponse = await apiClient.get(
        endpoints.CALENDAR_LANGUAGES,
        timeframe ? { timeframe } : {}
      )
      return transformLanguages(raw)
    },
    staleTime: Infinity,
  })
  return { isLoading, isError, languages: data?.languages ?? [] }
}

// Returns only the languages for which the current translator has assigned orders.
// Same endpoint — backend filters based on role server-side.
export const useFetchCalendarTranslatorLanguages = () => {
  const { isLoading, isError, data } = useQuery<CalendarLanguagesResponse>({
    queryKey: ['calendar-translator-languages'],
    queryFn: async () => {
      const raw: ApiCalendarLanguagesResponse = await apiClient.get(
        endpoints.CALENDAR_LANGUAGES
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
  const { isLoading, isError, data } = useQuery<CalendarWeekResponse>({
    queryKey: ['calendar-week', date],
    queryFn: async () => {
      const raw: ApiCalendarWeekResponse = await apiClient.get(
        endpoints.CALENDAR_WEEK,
        { date }
      )
      return transformWeekResponse(raw)
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarMonth = (date: string) => {
  const { isLoading, isError, data } = useQuery<CalendarMonthResponse>({
    queryKey: ['calendar-month', date],
    queryFn: async () => {
      const raw: ApiCalendarMonthResponse = await apiClient.get(
        endpoints.CALENDAR_MONTH,
        { date }
      )
      return transformMonthResponse(raw)
    },
    enabled: !!date,
  })
  return { isLoading, isError, data }
}

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
    queryKey: ['calendar-day-vendors', date, languageId],
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

export const useFetchCalendarWeekVendors = (
  date: string,
  languageId?: string
) => {
  const { isLoading, isError, data } = useQuery<
    CalendarWeekVendorsResponse | CalendarWeekVendorsAllResponse
  >({
    queryKey: ['calendar-week-vendors', date, languageId],
    queryFn: () =>
      languageId
        ? Promise.resolve(mockWeekVendors(date, languageId))
        : Promise.resolve({
            languages: MOCK_LANGUAGES.languages.map((l) =>
              mockWeekVendors(date, l.language.id)
            ),
          } as CalendarWeekVendorsAllResponse),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_WEEK_VENDORS, { date, language_id: languageId }),
    enabled: !!date && !!languageId,
  })
  return { isLoading, isError, data }
}

export const useFetchCalendarMonthVendors = (
  date: string,
  languageId?: string
) => {
  const { isLoading, isError, data } = useQuery<
    CalendarMonthVendorsResponse | CalendarMonthVendorsAllResponse
  >({
    queryKey: ['calendar-month-vendors', date, languageId],
    queryFn: () =>
      languageId
        ? Promise.resolve(mockMonthVendors(date, languageId))
        : Promise.resolve({
            languages: MOCK_LANGUAGES.languages.map((l) =>
              mockMonthVendors(date, l.language.id)
            ),
          } as CalendarMonthVendorsAllResponse),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_MONTH_VENDORS, { date, language_id: languageId }),
    enabled: !!date && !!languageId,
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
    mutationFn: (prebookId: string) =>
      apiClient.delete(endpoints.CALENDAR_PREBOOK, { id: prebookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
    },
  })
}

export const useCalendarSearch = () =>
  useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_params: CalendarSearchParams) =>
      new Promise<CalendarSearchResponse>((resolve) =>
        setTimeout(
          () => resolve({ dates: ['2026-03-12', '2026-03-15', '2026-03-17'] }),
          300
        )
      ),
    // mutationFn: (params: CalendarSearchParams) => apiClient.get(endpoints.CALENDAR_SEARCH, params),
  })

export const useFetchWeekSlotBookings = (
  params: { start_at: string; end_at: string; language_id: string } | null
) => {
  const { isLoading, data } = useQuery<WeekSlotBookingsResponse>({
    queryKey: [
      'week-slot-bookings',
      params?.start_at,
      params?.end_at,
      params?.language_id,
    ],
    enabled: !!params,
    queryFn: () =>
      new Promise<WeekSlotBookingsResponse>((resolve) =>
        setTimeout(
          () =>
            resolve({
              bookings: [
                {
                  id: 'proj-1',
                  ext_id: 'PPA-2021-04-S-126',
                  language: { id: 'lang-en', value: 'en', name: 'inglise' },
                },
                {
                  id: 'proj-2',
                  ext_id: 'PPA-225-08-T-3',
                  language: { id: 'lang-en', value: 'en', name: 'inglise' },
                },
                {
                  id: 'proj-3',
                  ext_id: 'MRQ-225-08-T-3',
                  language: { id: 'lang-en', value: 'en', name: 'inglise' },
                },
              ],
            }),
          300
        )
      ),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_WEEK_SLOT_BOOKINGS, params),
  })
  return { bookings: data?.bookings ?? [], isLoading }
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

export const useCreateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_payload: CreateOrderPayload) =>
      new Promise<{ id: string }>((resolve) =>
        setTimeout(() => resolve({ id: `order-${Date.now()}` }), 400)
      ),
    // mutationFn: (payload: CreateOrderPayload) => apiClient.post(endpoints.CALENDAR_ORDERS, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useAcceptCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_id: string) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // TODO: mutationFn: (id: string) => apiClient.post(endpoints.CALENDAR_ORDER_ACCEPT(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useDeclineCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_id: string) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // TODO: mutationFn: (id: string) => apiClient.post(endpoints.CALENDAR_ORDER_DECLINE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useConfirmCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_id: string) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // TODO: mutationFn: (id: string) => apiClient.post(endpoints.CALENDAR_ORDER_CONFIRM(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useRejectCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_id: string) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // TODO: mutationFn: (id: string) => apiClient.post(endpoints.CALENDAR_ORDER_REJECT(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useUpdateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_payload: UpdateOrderPayload) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // mutationFn: (payload: UpdateOrderPayload) =>
    //   apiClient.put(endpoints.CALENDAR_ORDER(payload.id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
}

export const useCancelCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: (_id: string) =>
      new Promise<void>((resolve) => setTimeout(resolve, 400)),
    // mutationFn: (id: string) => apiClient.delete(endpoints.CALENDAR_ORDER(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
    },
  })
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

export const useFetchCalendarOrderDetail = (id: string | null) => {
  const { isLoading, isError, data } = useQuery<CalendarOrderDetail>({
    queryKey: ['calendar-order-detail', id],
    enabled: !!id,
    queryFn: () =>
      new Promise<CalendarOrderDetail>((resolve) =>
        setTimeout(
          () =>
            resolve({
              id: id!,
              ext_id: 'PPA-2025-11-28-S-126',
              status: 'pending',
              language: { id: 'lang-fi', value: 'fi', name: 'Soome keel' },
              start_at: '2025-11-28T15:00:00Z',
              end_at: '2025-11-28T16:00:00Z',
              service_type: 'on-site',
              location: 'Tellija kirjutatud aadress Narva mnt 25, Tallinn',
              domain: 'Õigus',
              reference_number: 'PPA-2025-11-28-S-126',
              created_at: '2025-11-25T00:00:00Z',
              files_count: 2,
              files_accessible: false,
              client: {
                name: 'Tellija Nimi',
                institution: 'Politsei- ja piirivalveamet',
                email: 'info@asutusenimi.ee',
                phone: '+372 5432 1234',
              },
              coordinator: {
                name: 'Malle Karu',
                email: 'info@tõlkekorraldaja.ee',
                phone: '+372 5432 4321',
              },
              comments: [
                {
                  author: 'Malle Karu',
                  role: 'Tõlkekorraldaja',
                  text: 'Tõlketeenus toimub kohapeal. Palume tõlgil saabuda vähemalt 10 minutit enne teenuse algust, et jõuaks vajadusel täpsustada korralduslikke detaile. Teenus toimub kohapeal aadressil Narva mnt 25, Tallinn. Sisenemine peauksest, turvakontrolli läbimine on kohustuslik. Palume kaasa võtta isikut tõendav dokument.',
                  created_at: '2025-11-28T12:28:00Z',
                },
              ],
            }),
          300
        )
      ),
    // queryFn: () => apiClient.get(endpoints.CALENDAR_ORDER(id!)),
  })
  return { order: data ?? null, isLoading, isError }
}
