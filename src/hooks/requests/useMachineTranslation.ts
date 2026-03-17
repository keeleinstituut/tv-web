import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import {
  MTFileTranslationResponse,
  MTJobsResponse,
  MTProviderOptionsResponse,
  MTProvidersResponse,
  MTTextTranslationResponse,
  TranslateFilePayload,
  TranslateTextPayload,
} from 'types/machineTranslation'

export const useFetchMTProviders = () => {
  const { data, isLoading } = useQuery<MTProvidersResponse>({
    queryKey: ['mt_providers'],
    queryFn: () => apiClient.get(endpoints.MT_PROVIDERS),
    staleTime: Infinity,
  })

  return { providers: data?.data ?? [], isLoading }
}

export const useFetchMTProviderOptions = (provider: string | null) => {
  const { data, isLoading } = useQuery<MTProviderOptionsResponse>({
    enabled: !!provider,
    queryKey: ['mt_provider_options', provider],
    queryFn: () => apiClient.get(endpoints.MT_PROVIDER_OPTIONS(provider!)),
    staleTime: Infinity,
  })

  return { options: data?.data ?? null, isLoading }
}

export const useTranslateText = () => {
  const { mutateAsync: translateText, isPending: isLoading } =
    useMutation<MTTextTranslationResponse, unknown, TranslateTextPayload>({
      mutationFn: (payload) =>
        apiClient.post(endpoints.MT_TRANSLATE_TEXT, payload, { retries: 3 }), // Skip retries
    })

  return { translateText, isLoading }
}

export const useSubmitFileTranslation = () => {
  const { mutateAsync: submitFile, isPending: isLoading } =
    useMutation<MTFileTranslationResponse, unknown, TranslateFilePayload>({
      mutationFn: (payload) => {
        const { file, ...rest } = payload
        return apiClient.postForm(endpoints.MT_TRANSLATE_FILE, {
          ...rest,
          file,
        }, { retries: 3 }) // Skip retries
      },
    })

  return { submitFile, isLoading }
}

export const usePollMTJobsStatus = (jobIds: string[]) => {
  const { data } = useQuery<MTJobsResponse>({
    enabled: jobIds.length > 0,
    queryKey: ['mt_jobs_status', jobIds],
    queryFn: () => apiClient.get(endpoints.MT_JOBS, { id: jobIds }),
    refetchInterval: (data) => {
      const jobs = data?.data ?? []
      const isActive = jobs.some(
        (j) => j.status === 'pending' || j.status === 'processing'
      )
      return isActive ? 3000 : false
    },
  })

  return { jobs: data?.data ?? [] }
}
