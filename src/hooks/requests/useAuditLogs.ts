import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { AuditLogSettingsFormValues } from 'components/organisms/modals/AuditLogSettingsModal/AuditLogSettingsModal'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import { isEmpty, omit } from 'lodash'
import {
  AuditLogPayloadType,
  AuditLogSettingDataType,
  AuditLogsResponseDataType,
} from 'types/auditLogs'

export const useFetchAuditLogs = () => {
  const { filters, handleFilterChange, handlePaginationChange } =
    useFilters<AuditLogPayloadType>({
      per_page: 15,
    })

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

export const useFetchAuditLogSettings = ({
  institutionId,
}: {
  institutionId?: string
}) => {
  const { isLoading, isError, data } = useQuery<AuditLogSettingDataType>({
    enabled: !!institutionId,
    queryKey: ['audit-log-setting', institutionId],
    queryFn: () => apiClient.get(endpoints.AUDIT_LOG_SETTING(institutionId)),
  })
  const { data: setting } = data || {}

  return {
    setting,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useUpdateAuditLogSettings = ({
  institutionId,
}: {
  institutionId?: string
}) => {
  const queryClient = useQueryClient()
  const refetch = () =>
    queryClient.refetchQueries({
      queryKey: ['audit-log-setting', institutionId],
      type: 'active',
    })

  const { mutateAsync: updateSetting, isLoading } = useMutation({
    mutationKey: ['update-audit-log-setting'],
    mutationFn: async (payload: AuditLogSettingsFormValues) => {
      return apiClient.put(endpoints.AUDIT_LOG_SETTING(institutionId), payload)
    },
    onSuccess: refetch,
    onError: refetch,
  })

  return { updateSetting, isLoading }
}
