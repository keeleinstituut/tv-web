import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import i18n from 'i18n/i18n'
import { map } from 'lodash'
import {
  AuditLogPayloadType,
  AuditLogsResponseDataType,
  EventTypes,
} from 'types/auditLogs'

export const useFetchAuditLogs = () => {
  const { filters, handlePaginationChange } = useFilters<AuditLogPayloadType>()

  //   const { isLoading, isError, isFetching, data } =
  //     useQuery<AuditLogsResponseDataType>({
  //       // enabled: !isEmpty(otherFiltersAdded),
  //       queryKey: ['auditLogs', filters],
  //       queryFn: () => apiClient.get(endpoints.AUDIT_LOGS, filters),
  //       keepPreviousData: true,
  //     })

  const queryClient = useQueryClient()
  const {
    data,
    mutateAsync: fetchAuditLogs,
    isLoading,
  } = useMutation({
    mutationKey: ['auditLogs'],
    mutationFn: (payload: AuditLogPayloadType) =>
      apiClient.get(endpoints.AUDIT_LOGS, { ...payload, ...filters }),
  })

  const { meta: paginationData, data: logsData } = data || {}

  console.log('data', data)

  return {
    isLoading,
    logsData,
    paginationData,
    fetchAuditLogs,
    handlePaginationChange,
  }
}

export const useExportAuditLogsCSV = () => {
  const { mutateAsync: exportCSV, isLoading } = useMutation({
    mutationKey: ['csv'],
    mutationFn: async (payload: AuditLogPayloadType) =>
      apiClient.get(endpoints.EXPORT_AUDIT_LOGS, payload),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'audit_logs.csv',
      })
    },
  })
  return {
    isLoading,
    exportCSV,
  }
}

export const useEventTypesFetch = () => {
  //   const { isLoading, data } = useQuery<string[]>({
  //     queryKey: ['eventTypes'],
  //     queryFn: () => apiClient.get(endpoints.EVENT_TYPES),
  //   })

  const eventTypeFilters = map(EventTypes, (type) => {
    return { value: type, label: i18n.t(`logs.event_type.${type}`) }
  })
  return {
    eventTypeFilters,
    // isLoading,
  }
}
