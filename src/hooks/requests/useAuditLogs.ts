import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import { map } from 'lodash'
import { AuditLogPayloadType, AuditLogsResponseDataType } from 'types/auditLogs'

export const useFetchAuditLogs = (initialFilters?: AuditLogPayloadType) => {
  const { filters, handleFilterChange, handlePaginationChange } =
    useFilters<AuditLogPayloadType>(initialFilters)

  const { isLoading, isError, isFetching, data } =
    useQuery<AuditLogsResponseDataType>({
      queryKey: ['auditLogs', filters],
      queryFn: () => apiClient.get(endpoints.AUDIT_LOGS, filters),
      keepPreviousData: true,
    })
  const { meta: paginationData, data: users } = data || {}

  return {
    isLoading,
    isError,
    users,
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
        fileType: 'text/csv',
      })
    },
  })
  return {
    isLoading,
    exportCSV,
  }
}

export const useEventTypeFilter = () => {
  const { isLoading, data } = useQuery<string[]>({
    queryKey: ['eventTypes'],
    queryFn: () => apiClient.get(endpoints.EVENT_TYPES),
  })

  const eventTypeFilters = map(data, (type) => {
    return { value: type, label: type }
  })
  return {
    eventTypeFilters,
    isLoading,
  }
}
