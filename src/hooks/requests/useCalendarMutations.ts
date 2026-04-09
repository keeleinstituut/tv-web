import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { toCalendarApiDateTime } from 'helpers/calendar'
import { t } from 'i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import type {
  ApiCalendarSearchResponse,
  CalendarLanguagesResponse,
  CalendarSearchParams,
  CalendarSearchResponse,
  CreateOrderPayload,
  UpdateOrderPayload,
} from 'types/calendar'
import {
  transformProjectDetail,
  unwrapCalendarProjectPayload,
} from './calendarOrderDetailTransform'

/** Refetch project + calendar aggregates after cancel/decline (POST body can be incomplete). */
function invalidateCalendarProjectCaches(
  queryClient: QueryClient,
  projectId: string
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: ['calendar-order-detail', projectId],
    }),
    queryClient.invalidateQueries({ queryKey: ['calendar-day'] }),
    queryClient.invalidateQueries({ queryKey: ['calendar-week'] }),
    queryClient.invalidateQueries({ queryKey: ['calendar-month'] }),
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
    queryClient.invalidateQueries({ queryKey: ['calendar-slot-matching'] }),
    queryClient.invalidateQueries({ queryKey: ['vendor-calendar-entries'] }),
    queryClient.invalidateQueries({ queryKey: ['vendor-calendar'] }),
    queryClient.invalidateQueries({ queryKey: ['emergency-schedules'] }),
  ])
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

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
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-month'] })
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
    onSuccess: (response, variables) => {
      const raw = unwrapCalendarProjectPayload(response)
      if (typeof raw.id === 'string') {
        queryClient.setQueryData(
          ['calendar-order-detail', variables.id],
          transformProjectDetail(raw)
        )
      }
      void invalidateCalendarProjectCaches(queryClient, variables.id)
    },
  })
}

export const useDeclineCancelCalendarOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(endpoints.PROJECT_CANCEL_DECLINE(id), {}),
    onSuccess: (response, projectId) => {
      const raw = unwrapCalendarProjectPayload(response)
      if (typeof raw.id === 'string') {
        queryClient.setQueryData(
          ['calendar-order-detail', projectId],
          transformProjectDetail(raw)
        )
      }
      void invalidateCalendarProjectCaches(queryClient, projectId)
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

export const useImportCalendar = () => {
  return useMutation({
    mutationFn: ({ file, importEndDate }: { file: File; importEndDate: string }) =>
      apiClient.postForm(endpoints.CALENDAR_IMPORT, {
        file,
        import_end_date: importEndDate,
      }),
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
