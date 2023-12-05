import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  ExportTMXPayload,
  ImportTMXPayload,
  SubProjectTmKeysPayload,
  SubProjectTmKeysResponse,
  TmStatsType,
  TranslationMemoryDataType,
  TranslationMemoryFilters,
  TranslationMemoryPayload,
  TranslationMemoryPostType,
  TranslationMemoryType,
} from 'types/translationMemories'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import { map, flatten, join, omit, pick } from 'lodash'
import { SubProjectsResponse } from 'types/projects'
import { useCallback } from 'react'
import useWaitForLoading from 'hooks/useWaitForLoading'

dayjs.extend(customParseFormat)

export const useFetchTranslationMemories = (
  initialFilters?: TranslationMemoryFilters
) => {
  const {
    filters,
    handleFilterChange,
    //handlePaginationChange,
  } = useFilters<TranslationMemoryFilters>(initialFilters)

  const filterWithoutSearch = omit(filters, 'name')
  const searchValue = pick(filters, 'name')
  const queryString = join(
    flatten(
      map(filterWithoutSearch, (values, key) =>
        map(values, (value) => (value !== 'all' ? `${key}=${value}` : ''))
      )
    ),
    '&'
  )
  const { isLoading, isError, isFetching, data } =
    useQuery<TranslationMemoryDataType>({
      queryKey: ['translationMemories', filters],
      queryFn: () =>
        apiClient.get(
          `${endpoints.TRANSLATION_MEMORIES}?${queryString}`,
          searchValue
        ),
      keepPreviousData: true,
    })
  //TODO: Pagination is not done from BE side. This comes later

  const {
    // meta: paginationData,
    tags: translationMemories,
  } = data || {}

  return {
    isLoading,
    isError,
    translationMemories,
    isFetching,
    // paginationData,
    handleFilterChange,
    // handlePaginationChange,
  }
}

export const useFetchTranslationMemory = ({ id }: { id?: string }) => {
  const { isLoading, isError, isFetching, data } =
    useQuery<TranslationMemoryType>({
      enabled: !!id,
      queryKey: ['translationMemories', id],
      queryFn: () => apiClient.get(`${endpoints.TRANSLATION_MEMORIES}/${id}`),
    })

  return {
    isLoading,
    isError,
    translationMemory: data,
    isFetching,
  }
}

export const useFetchTmChunkAmounts = () => {
  const { data } = useQuery<TmStatsType>({
    queryKey: ['translationMemories-stats'],
    queryFn: () => apiClient.get(endpoints.TM_STATS),
  })
  return {
    tmChunkAmounts: data?.tag,
  }
}

export const useUpdateTranslationMemory = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateTranslationMemory, isLoading } = useMutation({
    mutationKey: ['translationMemories', id],
    mutationFn: async (payload: TranslationMemoryPostType) => {
      return apiClient.post(`${endpoints.TRANSLATION_MEMORIES}/${id}`, {
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['translationMemories', id],
        (oldData?: TranslationMemoryDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({
        queryKey: ['translationMemories'],
        type: 'active',
      })
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
          return { data: newData }
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
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['translationMemories'],
        (oldData?: TranslationMemoryDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({
        queryKey: ['translationMemories'],
        type: 'active',
      })
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
      formData.append('file', data.file)
      formData.append('tag', data.tag)
      return apiClient.put(endpoints.IMPORT_TMX, formData)
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

  const { mutateAsync: attemptFileDownload } = useMutation({
    mutationKey: ['tmx'],
    mutationFn: async (task_id?: string) =>
      apiClient.get(
        `${endpoints.EXPORT_TMX}/file/${task_id}`,
        {},
        { responseType: 'blob', hideError: true }
      ),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'translation_memory.tmx',
      })
    },
  })

  const startFileDownloadPolling = useCallback(
    async (job_id?: string) => {
      if (!job_id) return null
      try {
        await attemptFileDownload(job_id)
        finishLoading()
      } catch (error) {
        setTimeout(() => startFileDownloadPolling(job_id), 1000)
      }
    },
    [attemptFileDownload, finishLoading]
  )

  const { mutateAsync: exportTMX } = useMutation({
    mutationKey: ['tmx'],
    mutationFn: async (payload: ExportTMXPayload) =>
      apiClient.post(endpoints.EXPORT_TMX, payload),
    onSuccess: ({ job_id }: { job_id?: string }) => {
      startFileDownloadPolling(job_id)
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
}: {
  id?: string
}) => {
  const { filters, handlePaginationChange } =
    useFilters<TranslationMemoryFilters>()

  const { isLoading, isError, isFetching, data } =
    useQuery<SubProjectsResponse>({
      enabled: !!id,
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
  }
}

export const useFetchSubProjectTmKeys = ({ id }: { id?: string }) => {
  const { isLoading, isError, isFetching, data } =
    useQuery<SubProjectTmKeysResponse>({
      enabled: !!id,
      queryKey: ['subProject-tm-keys', id],
      queryFn: () => apiClient.get(`${endpoints.TM_KEYS}/${id}`),
    })

  return {
    isLoading,
    isError,
    SubProjectTmKeys: data?.data || [],
    isFetching,
  }
}

export const useUpdateSubProjectTmKeys = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateSubProjectTmKeys, isLoading } = useMutation({
    mutationKey: ['subProject-tm-keys'],
    mutationFn: async (payload: SubProjectTmKeysPayload) => {
      return apiClient.post(endpoints.UPDATE_TM_KEYS, {
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['subProject-tm-keys'],
        (oldData?: SubProjectTmKeysResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({
        queryKey: ['subProject-tm-keys'],
        type: 'active',
      })
    },
  })

  return {
    updateSubProjectTmKeys,
    isLoading,
  }
}
export const useToggleTmWritable = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: toggleTmWritable, isLoading } = useMutation({
    mutationKey: ['tm-writable'],
    mutationFn: async (payload: SubProjectTmKeysPayload) => {
      return apiClient.put(
        `${endpoints.TOGGLE_TM_WRITABLE}/${payload.id}`,
        omit(payload, 'id')
      )
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['tm-writable'],
        (oldData?: SubProjectTmKeysResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({
        queryKey: ['subProject-tm-keys'],
        type: 'active',
      })
    },
  })

  return {
    toggleTmWritable,
    isLoading,
  }
}
