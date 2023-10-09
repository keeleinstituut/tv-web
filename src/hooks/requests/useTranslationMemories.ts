import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  ExportTMXPayload,
  ImportTMXPayload,
  TranslationMemoryDataType,
  TranslationMemoryPayload,
  TranslationMemoryPostType,
  TranslationMemoryType,
} from 'types/translationMemories'
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'

dayjs.extend(customParseFormat)

export const useFetchTranslationMemories = (
  initialFilters?: TranslationMemoryPayload
) => {
  const {
    filters,
    handleOnSearch,
    handleFilterChange,
    //handlePaginationChange,
  } = useFilters<TranslationMemoryPayload>(initialFilters)

  console.log('Filters', filters)
  const { isLoading, isError, isFetching, data } =
    useQuery<TranslationMemoryDataType>({
      queryKey: ['translationMemories', filters],
      queryFn: () => apiClient.get(endpoints.TRANSLATION_MEMORIES, filters),
      keepPreviousData: true,
    })

  console.log('data', data)

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
    handleOnSearch,
    handleFilterChange,
    // handlePaginationChange,
  }
}

export const useFetchTranslationMemory = ({ id }: { id?: string }) => {
  const { isLoading, isError, isFetching, data } =
    useQuery<TranslationMemoryType>({
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
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
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
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
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
  const { mutateAsync: exportTMX, isLoading } = useMutation({
    mutationKey: ['tmx'],
    mutationFn: async (payload: ExportTMXPayload) =>
      apiClient.post(endpoints.EXPORT_TMX, payload),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'translation_memory.tmx',
        fileType: 'application/xml',
      })
    },
  })
  return {
    isLoading,
    exportTMX,
  }
}
