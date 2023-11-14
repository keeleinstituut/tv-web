import { useMutation, useQuery } from '@tanstack/react-query'
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

export const useFetchAuditLogs = (initialFilters?: AuditLogPayloadType) => {
  const { filters, handleFilterChange, handlePaginationChange } =
    useFilters<AuditLogPayloadType>(initialFilters)

  const { isLoading, isError, isFetching, data } =
    useQuery<AuditLogsResponseDataType>({
      queryKey: ['auditLogs', filters],
      // queryFn: () => apiClient.get(endpoints.AUDIT_LOGS, filters),
      keepPreviousData: true,
    })
  const { meta: paginationData, data: logsData } = data || {}

  return {
    isLoading,
    isError,
    logsData,
    paginationData,
    handleFilterChange,
    handlePaginationChange,
    isFetching,
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
