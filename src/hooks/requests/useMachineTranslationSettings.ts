import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import {
  AzureOpenAISettings,
  AzureOpenAISettingsPayload,
  AzureOpenAISettingsResponse,
} from 'types/machineTranslation'

export const useFetchAzureOpenAISettings = () => {
  const { data, isLoading } = useQuery<AzureOpenAISettingsResponse>({
    queryKey: ['mt_azure_openai_settings'],
    queryFn: () => apiClient.get(endpoints.MT_INSTITUTION_SETTINGS),
  })

  return { settings: data?.data ?? null, isLoading }
}

export const useUpdateAzureOpenAISettings = () => {
  const queryClient = useQueryClient()

  const { mutateAsync: updateSettings, isPending: isLoading } = useMutation<
    AzureOpenAISettingsResponse,
    unknown,
    AzureOpenAISettingsPayload
  >({
    mutationFn: (payload) =>
      apiClient.put(endpoints.MT_INSTITUTION_SETTINGS, payload),
    onSuccess: (response) => {
      queryClient.setQueryData<AzureOpenAISettingsResponse>(
        ['mt_azure_openai_settings'],
        response
      )
    },
  })

  return { updateSettings, isLoading }
}
