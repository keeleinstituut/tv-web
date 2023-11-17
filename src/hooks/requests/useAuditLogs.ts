import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import { isEmpty, omit } from 'lodash'
import { AuditLogPayloadType, AuditLogsResponseDataType } from 'types/auditLogs'

export const useFetchAuditLogs = () => {
  const { filters, handleFilterChange, handlePaginationChange } =
    useFilters<AuditLogPayloadType>()

  const { isLoading, data } = useQuery<AuditLogsResponseDataType>({
    enabled: !isEmpty(omit(filters, ['page', 'per_page'])),
    queryKey: ['auditLogs', filters],
    queryFn: () => apiClient.get(endpoints.AUDIT_LOGS, filters),
    keepPreviousData: true,
  })
  const { meta: paginationData, data: logsData } = data || {}

  return {
    isLoading,
    logsData,
    paginationData,
    handleFilterChange,
    filters,
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
