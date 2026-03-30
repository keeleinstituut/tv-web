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
  ApiCalendarWeekResponse,
  ApiCalendarMonthResponse,
  ApiSlotMatchingVendor,
  ApiCalendarSearchResponse,
  transformLanguages,
  transformDayResponse,
  transformWeekResponse,
  transformMonthResponse,
} from 'types/calendar'

dayjs.extend(isoWeek)
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { toCalendarApiDateTime } from 'helpers/calendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { t } from 'i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

// ---------------------------------------------------------------------------
// Hooks
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

export const useCreatePrebook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: {
      language_id: string
      start_at: string
      end_at: string
      vendor_id?: string
    }) =>
      apiClient.post(endpoints.CALENDAR_PREBOOK, {
        ...params,
        start_at: toCalendarApiDateTime(params.start_at),
        end_at: toCalendarApiDateTime(params.end_at),
      }),
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
          datetime: params.datetime,
          duration_minutes: params.duration_minutes,
        })
        .then(
          (res: {
            data: ApiCalendarSearchResponse
          }): CalendarSearchResponse => ({
            start_at: res.data?.start_at ?? null,
          })
        ),
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

function buildCalendarProjectCreateFormData(
  payload: CreateOrderPayload
): FormData {
  const fd = new FormData()
  fd.append('is_calendar_project', '1')
  fd.append('destination_language_classifier_value_ids[]', payload.language_id)
  fd.append('event_start_at', toCalendarApiDateTime(payload.start_at))
  fd.append('event_end_at', toCalendarApiDateTime(payload.end_at))
  fd.append('service_type', payload.service_type)
  if (payload.reference_number)
    fd.append('reference_number', payload.reference_number)
  if (payload.location) fd.append('location', payload.location)
  if (payload.meeting_link) fd.append('meeting_link', payload.meeting_link)
  if (payload.tag_ids?.length) {
    for (const tagId of payload.tag_ids) {
      fd.append('tags[]', tagId)
    }
  }
  if (payload.client_institution_id) {
    fd.append('client_institution_user_id', payload.client_institution_id)
  }
  if (payload.vendor_id) {
    fd.append('candidate_vendor_id', payload.vendor_id)
  }
  if (payload.comment) {
    fd.append('comment', payload.comment)
  }
  for (const file of payload.help_files ?? []) {
    fd.append('help_files[]', file)
    fd.append('help_file_types[]', 'REFERENCE_FILE')
  }
  return fd
}

export const useCreateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiClient
        .post(endpoints.PROJECTS, buildCalendarProjectCreateFormData(payload))
        .then((body: unknown) => {
          const b = body as {
            data?: { id: string; created_at?: string }
            id?: string
            created_at?: string
          }
          if (b.data?.id) return b.data
          if (b.id) return { id: b.id, created_at: b.created_at ?? '' }
          throw new Error('Invalid create project response')
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
    },
  })
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

export const useUpdateCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) =>
      apiClient.put(`${endpoints.PROJECTS}/${payload.id}`, {
        ...(payload.service_type ? { service_type: payload.service_type } : {}),
        ...(payload.reference_number !== undefined
          ? { reference_number: payload.reference_number }
          : {}),
        ...(payload.location !== undefined
          ? { location: payload.location }
          : {}),
        ...(payload.meeting_link !== undefined
          ? { meeting_link: payload.meeting_link }
          : {}),
        ...(payload.start_at
          ? { event_start_at: toCalendarApiDateTime(payload.start_at) }
          : {}),
        ...(payload.end_at
          ? { event_end_at: toCalendarApiDateTime(payload.end_at) }
          : {}),
        ...(payload.tag_ids?.length ? { tags: payload.tag_ids } : {}),
        ...(payload.client_institution_id
          ? { client_institution_user_id: payload.client_institution_id }
          : {}),
        ...(payload.vendor_id
          ? { candidate_vendor_id: payload.vendor_id }
          : {}),
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
    mutationFn: ({
      id,
      cancellation_reason,
      cancellation_comment,
      is_delayed,
    }: {
      id: string
      cancellation_reason: string
      cancellation_comment?: string
      is_delayed?: boolean
    }) =>
      apiClient.post(`${endpoints.PROJECTS}/${id}/cancel`, {
        cancellation_reason,
        ...(cancellation_comment ? { cancellation_comment } : {}),
        ...(is_delayed !== undefined ? { is_delayed } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-order-detail'] })
    },
  })
}

export const useDeclineCancelCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(endpoints.PROJECT_CANCEL_DECLINE(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-order-detail'] })
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

export const useAddCalendarOrderComment = (
  projectId: string | null | undefined
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (comment: string) =>
      apiClient.post(endpoints.PROJECT_COMMENTS(projectId!), { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-order-detail', projectId],
      })
    },
  })
}

export const useUpdateCalendarOrderComment = (
  projectId: string | null | undefined
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      commentId,
      comment,
    }: {
      commentId: string
      comment: string
    }) =>
      apiClient.put(endpoints.PROJECT_COMMENT(projectId!, commentId), {
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-order-detail', projectId],
      })
    },
  })
}

function mapProjectMediaList(
  raw: unknown
): NonNullable<CalendarOrderDetail['source_files']> {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const f = item as Record<string, unknown>
    const cn = f.collection_name as string | undefined
    return {
      id: String(f.id ?? ''),
      name: String(f.name ?? ''),
      file_name: String(f.file_name ?? ''),
      size: Number(f.size ?? 0),
      collection_name:
        cn === 'help' || cn === 'source' || cn === 'final' ? cn : undefined,
    }
  })
}

const transformProjectDetail = (
  raw: Record<string, unknown>
): CalendarOrderDetail => {
  const langs =
    (raw.destination_languages_classifier_values as Array<{
      id: string
      value: string
      name: string
    }>) ?? []
  const subProjects = (raw.sub_projects ?? []) as Array<{
    destination_language_classifier_value?: {
      id: string
      value: string
      name: string
    }
  }>
  const lang = langs[0] ??
    subProjects[0]?.destination_language_classifier_value ?? {
      id: '',
      value: '',
      name: '',
    }

  const clientUser = raw.client_institution_user as
    | {
        id: string
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
        institution?: { name?: string }
      }
    | undefined

  const coordinatorUser = raw.manager_institution_user as
    | {
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
      }
    | undefined

  return {
    id: raw.id as string,
    ext_id: raw.ext_id as string,
    status: raw.status as CalendarOrderDetail['status'],
    language: lang,
    start_at: (raw.event_start_at as string) ?? (raw.start_at as string),
    end_at: (raw.event_end_at as string) ?? (raw.end_at as string),
    service_type: ((raw.service_type as string) ?? '').toUpperCase() as
      | 'REMOTE'
      | 'ON_SITE',
    location: raw.location as string | undefined,
    meeting_link: raw.meeting_link as string | undefined,
    reference_number: raw.reference_number as string | undefined,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string | undefined,
    accepted_at: raw.accepted_at as string | undefined,
    cancel_at: raw.cancel_at as string | undefined,
    cancelled_at: raw.cancelled_at as string | undefined,
    completed_at: raw.completed_at as string | undefined,
    client_institution_user: clientUser ? { id: clientUser.id } : undefined,
    client: clientUser
      ? {
          name:
            [clientUser.user?.forename, clientUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          institution: clientUser.institution?.name ?? '',
          email: clientUser.email ?? '',
          phone: clientUser.phone ?? '',
        }
      : undefined,
    coordinator: coordinatorUser
      ? {
          name:
            [coordinatorUser.user?.forename, coordinatorUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          email: coordinatorUser.email ?? '',
          phone: coordinatorUser.phone ?? '',
        }
      : undefined,
    tags: raw.tags as CalendarOrderDetail['tags'],
    source_files: [
      ...mapProjectMediaList(raw.help_files),
      ...mapProjectMediaList(raw.source_files),
    ],
    files_count: (raw.files_count as number) ?? 0,
    files_accessible: (raw.files_accessible as boolean) ?? false,
    project_comments:
      raw.project_comments as CalendarOrderDetail['project_comments'],
  }
}

export const useFetchCalendarOrderDetail = (id: string | null) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ['calendar-order-detail', id],
    enabled: !!id,
    queryFn: () =>
      apiClient
        .get(`${endpoints.PROJECTS}/${id}`)
        .then((res: { data: Record<string, unknown> }) =>
          transformProjectDetail(res.data)
        ),
  })
  return { order: data ?? null, isLoading, isError }
}

export const useCalendarAddFiles = (projectId: string | null | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => {
      if (!projectId) return Promise.reject(new Error('no project id'))
      return apiClient.postForm(endpoints.MEDIA_BULK, {
        files: files.map((f) => ({
          content: f,
          reference_object_id: projectId,
          reference_object_type: 'project',
          collection: 'help',
          help_file_type: 'REFERENCE_FILE' as const,
        })),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-order-detail', projectId],
      })
    },
  })
}

export const useCalendarDeleteFile = (projectId: string | null | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      collection = 'help',
    }: {
      id: string
      collection?: 'help' | 'source' | 'final'
    }) => {
      if (!projectId) return Promise.reject(new Error('no project id'))
      return apiClient.delete(endpoints.MEDIA_BULK, {
        files: [
          {
            id,
            reference_object_id: projectId,
            reference_object_type: 'project',
            collection,
          },
        ],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-order-detail', projectId],
      })
    },
  })
}

export const useCalendarDownloadFile = ({
  projectId,
}: {
  projectId: string | null | undefined
}) => {
  return useMutation({
    mutationFn: ({
      id,
      collection = 'help',
    }: {
      id: string
      file_name: string
      collection?: 'help' | 'source' | 'final'
    }) => {
      if (!projectId) return Promise.reject(new Error('no project id'))
      return apiClient.get(
        endpoints.MEDIA_DOWNLOAD,
        {
          id,
          reference_object_id: projectId,
          reference_object_type: 'project',
          collection,
        },
        { responseType: 'blob' }
      )
    },
    onSuccess: async (data, { file_name }) => {
      if (!(data instanceof Blob)) {
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.error'),
          content: t('calendar.download_failed'),
        })
        return
      }
      if (data.type.includes('json')) {
        try {
          const text = await data.text()
          const parsed = JSON.parse(text) as { message?: string }
          showNotification({
            type: NotificationTypes.Error,
            title: t('notification.error'),
            content: parsed.message ?? t('calendar.download_failed'),
          })
        } catch {
          showNotification({
            type: NotificationTypes.Error,
            title: t('notification.error'),
            content: t('calendar.download_failed'),
          })
        }
        return
      }
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file_name
      a.click()
      URL.revokeObjectURL(url)
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
      queryClient.invalidateQueries({
        queryKey: ['emergency-schedules', vendorId],
      })
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
      queryClient.invalidateQueries({
        queryKey: ['emergency-schedules', vendorId],
      })
    },
  })
}

// ---------------------------------------------------------------------------
// Type re-exports for convenience
// ---------------------------------------------------------------------------

export type { SlotMatchingVendor } from 'types/calendar'
