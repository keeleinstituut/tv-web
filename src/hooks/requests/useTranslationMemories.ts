import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  ContextCheckFilters,
  ContextCheckListResponse,
  ContextCheckPayload,
  ExportTMXPayload,
  ImportTMXPayload,
  TranslationMemoryDataType,
  TranslationMemoryFilters,
  TranslationMemoryPayload,
  TranslationMemoryPostType,
  TranslationMemoryResponse,
} from 'types/translationMemories'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import { filter } from 'lodash'
import { SubProjectsResponse } from 'types/projects'
import { useCallback, useEffect } from 'react'
import useWaitForLoading from 'hooks/useWaitForLoading'
import { PaginationFunctionType } from 'types/collective'

dayjs.extend(customParseFormat)

const toTranslationMemoryQueryParams = (
  filters: TranslationMemoryFilters,
  tenantId?: string
) => {
  const { lang_pair, ...rest } = filters
  const params = tenantId ? { ...rest, tenant_id: tenantId } : rest
  if (!lang_pair?.length) return params

  const source_locale: string[] = []
  const target_locale: string[] = []
  lang_pair.forEach((pair) => {
    const [source, target] = pair.split('_')
    if (source && target) {
      source_locale.push(source)
      target_locale.push(target)
    }
  })

  return { ...params, source_locale, target_locale }
}

export const useFetchTranslationMemories = ({
  initialFilters,
  disabled,
  saveQueryParams,
  key,
  tenantId,
}: {
  initialFilters?: TranslationMemoryFilters
  disabled?: boolean
  saveQueryParams?: boolean
  key?: string
  tenantId?: string
}) => {
  const {
    filters,
    handleFilterChange,
    //handlePaginationChange,
  } = useFilters<TranslationMemoryFilters>(initialFilters, saveQueryParams)

  const { isLoading, isError, isFetching, data, refetch } =
    useQuery<TranslationMemoryDataType>({
      enabled: !disabled,
      queryKey: ['translationMemories', ...(key ? [key] : [])],
      queryFn: () =>
        apiClient.get(
          endpoints.TRANSLATION_MEMORIES,
          toTranslationMemoryQueryParams(
            filters as TranslationMemoryFilters,
            tenantId
          )
        ),
      keepPreviousData: true,
    })

  useEffect(() => {
    if (!disabled) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, tenantId])

  //TODO: Pagination is not done from BE side. This comes later

  const {
    // meta: paginationData,
    data: translationMemories,
    segment_counts,
  } = data || {}

  return {
    isLoading,
    isError,
    translationMemories,
    isFetching,
    filters: filters as TranslationMemoryFilters,
    // paginationData,
    handleFilterChange,
    // handlePaginationChange,
    translationMemoriesSegmentCounts: segment_counts,
  }
}

export const useFetchTranslationMemory = ({ id }: { id?: string }) => {
  const { isLoading, isError, isFetching, data } =
    useQuery<TranslationMemoryResponse>({
      enabled: !!id,
      queryKey: ['translationMemories', id],
      queryFn: () => apiClient.get(`${endpoints.TRANSLATION_MEMORIES}/${id}`),
    })

  return {
    isLoading,
    isError,
    translationMemory: data?.data,
    chunk_amount: data?.segment_count,
    edit_url: data?.edit_url,
    isFetching,
  }
}

export const useUpdateTranslationMemory = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateTranslationMemory, isLoading } = useMutation({
    mutationKey: ['translationMemories', id],
    mutationFn: async (payload: TranslationMemoryPostType) => {
      return apiClient.put(`${endpoints.TRANSLATION_MEMORIES}/${id}`, {
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['translationMemories', id],
        (oldData?: TranslationMemoryResponse) => {
          if (!oldData) return oldData
          return { ...oldData, data }
        }
      )
    },
  })

  return {
    updateTranslationMemory,
    isLoading,
  }
}

export const useCreateTranslationMemory = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: createTranslationMemory, isLoading } = useMutation({
    mutationKey: ['translationMemories'],
    mutationFn: (payload: TranslationMemoryPayload) =>
      apiClient.post(endpoints.TRANSLATION_MEMORIES, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['translationMemories'],
        (oldData?: TranslationMemoryDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, data]
          return { ...oldData, data: newData }
        }
      )
    },
  })

  return {
    createTranslationMemory,
    isLoading,
  }
}

export const useDeleteTranslationMemory = () => {
  const queryClient = useQueryClient()
  const { mutate: deleteTranslationMemory, isLoading } = useMutation({
    mutationKey: ['translationMemories'],
    mutationFn: (id: string) =>
      apiClient.delete(`${endpoints.TRANSLATION_MEMORIES}/${id}`),
    onSuccess: (_response, deletedId) => {
      queryClient.setQueryData(
        ['translationMemories'],
        (oldData?: TranslationMemoryDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = filter(previousData, ({ id }) => id !== deletedId)
          return { ...oldData, data: newData }
        }
      )
    },
  })

  return {
    deleteTranslationMemory,
    isLoading,
  }
}

export const useImportTMX = () => {
  const formData = new FormData()
  const {
    mutateAsync: importTMX,
    isLoading,
    error,
  } = useMutation({
    mutationKey: ['tmx'],
    mutationFn: async (data: ImportTMXPayload) => {
      formData.append('files[]', data.file)
      formData.append('translation_memory_id', data.tag)
      return apiClient.post(endpoints.TRANSLATION_MEMORIES_IMPORT, formData)
    },
  })

  return {
    importTMX,
    isLoading,
    error,
  }
}

export const useExportTMX = () => {
  const { isLoading, finishLoading, startLoading, waitForLoadingToFinish } =
    useWaitForLoading()

  const { mutateAsync: exportTMX } = useMutation({
    mutationKey: ['tmx'],
    mutationFn: async (payload: ExportTMXPayload) =>
      apiClient.post(endpoints.TRANSLATION_MEMORIES_EXPORT, payload, { responseType: 'blob' }),
    onSuccess: (data) => {
      finishLoading()
      downloadFile({
        data,
        fileName: 'translation_memory.zip',
      })
    },
  })

  const exportFunction = useCallback(
    async (payload: ExportTMXPayload) => {
      startLoading()
      await exportTMX(payload)
      await waitForLoadingToFinish()
    },
    [exportTMX, startLoading, waitForLoadingToFinish]
  )

  return {
    isLoading,
    exportTMX: exportFunction,
  }
}

export const useFetchTranslationMemorySubProjects = ({
  id,
  initialFilters,
  saveQueryParams,
  disabled,
}: {
  id?: string
  initialFilters?: PaginationFunctionType
  saveQueryParams?: boolean
  disabled?: boolean
}) => {
  const { filters, handlePaginationChange } =
    useFilters<TranslationMemoryFilters>(initialFilters, saveQueryParams)

  const { isLoading, isError, isFetching, data } =
    useQuery<SubProjectsResponse>({
      enabled: !!id && !disabled,
      queryKey: ['tm-subProjects', id, filters],
      queryFn: () =>
        apiClient.get(`${endpoints.TM_SUB_PROJECTS}/${id}`, filters),
      keepPreviousData: true,
    })

  const { meta: paginationData, data: subProjects } = data || {}

  return {
    isLoading,
    isError,
    subProjects,
    isFetching,
    paginationData,
    handlePaginationChange,
    filters: filters as PaginationFunctionType,
  }
}

export const useFetchTranslationMemoryContextChecks = (options?: {
  initialFilters: ContextCheckFilters
  refetchInterval?: number
}) => {
  const saveQueryParams = false
  const { initialFilters = {}, refetchInterval = undefined } = options || {}

  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<ContextCheckFilters>(initialFilters, saveQueryParams)

  const { isLoading, isError, data, refetch } =
    useQuery<ContextCheckListResponse>({
      queryKey: ['translation-memory-context-checks', filters],
      queryFn: () => apiClient.get(`${endpoints.TM_CONTENT_CHECKS}`, filters),
      keepPreviousData: true,
      refetchInterval,
    })

  const { meta: paginationData, data: contextChecks } = data || {}

  return {
    isLoading,
    isError,
    contextChecks,
    paginationData,
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    refetch,
  }
}

export const useCreateTranslationMemoryContextCheck = () => {
  const { mutateAsync: createContextCheck, isLoading } = useMutation({
    mutationKey: ['translationMemories'],
    mutationFn: (payload: ContextCheckPayload) =>
      apiClient.post(endpoints.TM_CONTENT_CHECKS, payload),
  })

  return {
    createContextCheck,
    isLoading,
  }
}

