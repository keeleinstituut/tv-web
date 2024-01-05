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
import { map, flatten, join, omit, pick, filter } from 'lodash'
import { SubProjectsResponse } from 'types/projects'
import { useCallback, useEffect } from 'react'
import useWaitForLoading from 'hooks/useWaitForLoading'
import { PaginationFunctionType } from 'types/collective'

dayjs.extend(customParseFormat)

export const useFetchTranslationMemories = ({
  initialFilters,
  disabled,
  saveQueryParams,
  key,
}: {
  initialFilters?: TranslationMemoryFilters
  disabled?: boolean
  saveQueryParams?: boolean
  key?: string
}) => {
  const {
    filters,
    handleFilterChange,
    //handlePaginationChange,
  } = useFilters<TranslationMemoryFilters>(initialFilters, saveQueryParams)

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
  const { isLoading, isError, isFetching, data, refetch } =
    useQuery<TranslationMemoryDataType>({
      enabled: !disabled,
      queryKey: ['translationMemories', ...(key ? [key] : [])],
      queryFn: () =>
        apiClient.get(
          `${endpoints.TRANSLATION_MEMORIES}?${queryString}`,
          searchValue
        ),
      keepPreviousData: true,
    })

  useEffect(() => {
    if (!disabled) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

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
    filters: filters as TranslationMemoryFilters,
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
export const useFetchTmChunkAmounts = ({
  disabled,
}: {
  disabled?: boolean
}) => {
  const { data } = useQuery<TmStatsType>({
    enabled: !disabled,
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
    onSuccess: ({ tag: data }) => {
      queryClient.setQueryData(
        ['translationMemories', id],
        (oldData?: TranslationMemoryType) => {
          const previousData = oldData || {}
          if (!previousData) return oldData
          return data
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
    onSuccess: ({ tag: data }) => {
      queryClient.setQueryData(
        ['translationMemories'],
        (oldData?: TranslationMemoryDataType) => {
          const { tags: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, data]
          return { tags: newData }
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
    onSuccess: ({ tag: data }) => {
      queryClient.setQueryData(
        ['translationMemories'],
        (oldData?: TranslationMemoryDataType) => {
          const { tags: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = filter(previousData, ({ id }) => id !== data.id)
          return { tags: newData }
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
        fileName: 'translation_memory.zip',
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

export const useFetchSubProjectTmKeys = ({
  subProjectId,
  disabled,
}: {
  subProjectId?: string
  disabled?: boolean
}) => {
  const { isLoading, isError, isFetching, data } =
    useQuery<SubProjectTmKeysResponse>({
      enabled: !!subProjectId && !disabled,
      queryKey: ['subProject-tm-keys', subProjectId],
      queryFn: () => apiClient.get(`${endpoints.TM_KEYS}/${subProjectId}`),
    })

  return {
    isLoading,
    isError,
    subProjectTmKeyObjectsArray: data?.data || [],
    isFetching,
  }
}

export const useUpdateSubProjectTmKeys = ({
  subProjectId,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateSubProjectTmKeys, isLoading } = useMutation({
    mutationKey: ['subProject-tm-keys', subProjectId],
    mutationFn: async (payload: SubProjectTmKeysPayload) => {
      return apiClient.post(endpoints.UPDATE_TM_KEYS, {
        sub_project_id: subProjectId,
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['subProject-tm-keys', subProjectId],
        (oldData?: SubProjectTmKeysResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          return { data }
        }
      )
    },
  })

  return {
    updateSubProjectTmKeys,
    isLoading,
  }
}
export const useToggleTmWritable = ({
  subProjectId,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: toggleTmWritable, isLoading } = useMutation({
    mutationKey: ['subProject-tm-keys', subProjectId],
    mutationFn: async (payload: SubProjectTmKeysPayload) => {
      return apiClient.put(
        `${endpoints.TOGGLE_TM_WRITABLE}/${payload.id}`,
        omit(payload, 'id')
      )
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['subProject-tm-keys', subProjectId],
        (oldData?: SubProjectTmKeysResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [
            ...filter(previousData, ({ id }) => id !== data.id),
            data,
          ]

          return { data: newData }
        }
      )
    },
  })

  return {
    toggleTmWritable,
    isLoading,
  }
}

export const useCreateEmptyTm = ({
  subProjectId,
  key,
}: {
  subProjectId?: string
  key?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createEmptyTm, isLoading } = useMutation({
    mutationKey: ['subProject-tm-keys', subProjectId],
    mutationFn: () => apiClient.post(`${endpoints.TM_KEYS}/${subProjectId}`),
    onSuccess: ({ data }) => {
      const { cat_tm_key, cat_tm_meta } = data || {}
      queryClient.setQueryData(
        ['subProject-tm-keys', subProjectId],
        (oldData?: SubProjectTmKeysResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, cat_tm_key]
          return { data: newData }
        }
      )
      queryClient.setQueryData(
        ['translationMemories', key],
        (oldData?: TranslationMemoryDataType) => {
          const { tags: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, cat_tm_meta?.tag]
          return { tags: newData }
        }
      )
    },
  })

  return {
    isLoading,
    createEmptyTm,
  }
}
