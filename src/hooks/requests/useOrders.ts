import {
  OrdersResponse,
  OrdersPayloadType,
  OrderResponse,
  NewOrderPayload,
  SubOrdersResponse,
  SubOrderResponse,
  SubOrdersPayloadType,
  CatProjectPayload,
  CatToolJobsResponse,
  SubOrderPayload,
  CatJobsPayload,
} from 'types/orders'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { findIndex, includes } from 'lodash'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'

export const useFetchOrders = () => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<OrdersPayloadType>()

  const { isLoading, isError, data } = useQuery<OrdersResponse>({
    queryKey: ['orders', filters],
    queryFn: () => apiClient.get(`${endpoints.PROJECTS}`, filters),
  })

  const { meta: paginationData, data: orders } = data || {}

  return {
    isLoading,
    isError,
    orders,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchOrder = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<OrderResponse>({
    queryKey: ['orders', id],
    queryFn: () => apiClient.get(`${endpoints.PROJECTS}/${id}`),
  })

  const { data: order } = data || {}

  return {
    isLoading,
    isError,
    order,
  }
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const formData = new FormData()
  const { mutateAsync: createOrder, isLoading } = useMutation({
    mutationKey: ['orders'],
    mutationFn: (payload: NewOrderPayload) => {
      for (const key in payload) {
        const typedKey = key as keyof NewOrderPayload
        const value = payload[typedKey]
        if (
          includes(
            [
              'destination_language_classifier_value_ids',
              'help_files',
              'help_file_types',
              'source_files',
            ],
            typedKey
          )
        ) {
          const typedValue = (value as string[] | File[]) || []
          for (const key in typedValue) {
            formData.append(`${typedKey}[]`, typedValue[key])
          }
        } else {
          const typedValue = (value as string) || ''
          formData.append(typedKey, typedValue)
        }
      }
      return apiClient.post(endpoints.PROJECTS, formData)
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['orders'], (oldData?: OrdersResponse) => {
        const { data: previousData, meta } = oldData || {}
        if (!previousData || !meta) return oldData
        const newData = [...previousData, data]
        return { data: newData, meta }
      })
    },
  })

  return {
    createOrder,
    isLoading,
  }
}

export const useUpdateOrder = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateOrder, isLoading } = useMutation({
    mutationKey: ['orders', id],
    mutationFn: (payload: NewOrderPayload) =>
      apiClient.put(`${endpoints.PROJECTS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['orders'], (oldData?: OrdersResponse) => {
        const { data: previousData, meta } = oldData || {}
        if (!previousData || !meta) return oldData
        const orderIndex = findIndex(previousData, { id })
        const newArray = [...previousData]
        newArray[orderIndex] = data
        return { meta, data: newArray }
      })
    },
  })

  return {
    updateOrder,
    isLoading,
  }
}

export const useUpdateSubOrder = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateSubOrder, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: SubOrderPayload) =>
      apiClient.put(`${endpoints.SUB_PROJECTS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['suborders', id],
        (oldData?: SubOrderResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    updateSubOrder,
    isLoading,
  }
}

export const useFetchSubOrder = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<SubOrderResponse>({
    queryKey: ['suborders', id],
    queryFn: () => apiClient.get(`${endpoints.SUB_PROJECTS}/${id}`),
  })

  const { data: subOrder } = data || {}

  return {
    isLoading,
    isError,
    subOrder,
  }
}

export const useFetchSubOrders = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<SubOrdersPayloadType>()

  const { isLoading, isError, data } = useQuery<SubOrdersResponse>({
    queryKey: ['suborders', filters],
    queryFn: () => apiClient.get(`${endpoints.SUB_PROJECTS}`, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: subOrders } = data || {}

  return {
    isLoading,
    isError,
    subOrders,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useSubOrderSendToCat = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: sendToCat, isLoading } = useMutation({
    mutationKey: ['send_cat'],
    mutationFn: (payload: CatProjectPayload) =>
      apiClient.post(endpoints.CAT_TOOL_SETUP, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cat-jobs'], type: 'active' })
    },
  })
  return {
    sendToCat,
    isCatProjectLoading: isLoading,
  }
}

export const useFetchSubOrderCatToolJobs = ({ id }: { id?: string }) => {
  const { data } = useQuery<CatToolJobsResponse>({
    enabled: !!id,
    queryKey: ['cat-jobs', id],
    queryFn: () => apiClient.get(`${endpoints.CAT_TOOL_JOBS}/${id}`),
  })
  return {
    catToolJobs: data?.data?.cat_jobs,
    catSetupStatus: data?.data?.setup_status,
    catAnalyzeStatus: data?.data?.analyzing_status,
  }
}

export const useSplitCatJobs = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: splitCatJobs, isLoading } = useMutation({
    mutationKey: ['cat-jobs'],
    mutationFn: (payload: CatJobsPayload) =>
      apiClient.post(endpoints.CAT_TOOL_SPLIT, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['cat-jobs'],
        (oldData?: CatToolJobsResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    splitCatJobs,
    isLoading,
  }
}
export const useMergeCatJobs = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: mergeCatJobs, isLoading } = useMutation({
    mutationKey: ['cat-jobs'],
    mutationFn: (payload: CatJobsPayload) =>
      apiClient.post(endpoints.CAT_TOOL_MERGE, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['cat-jobs'],
        (oldData?: CatToolJobsResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    mergeCatJobs,
    isLoading,
  }
}

export const useDownloadXliffFile = () => {
  const { mutateAsync: downloadXliff, isLoading } = useMutation({
    mutationKey: ['xliff'],
    mutationFn: (sub_project_id: string) =>
      apiClient.get(`${endpoints.DOWNLOAD_XLIFF}/${sub_project_id}`),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'xliff.xml',
        fileType: 'text/xml',
      })
    },
  })
  return {
    isLoading,
    downloadXliff,
  }
}
export const useDownloadTranslatedFile = () => {
  const { mutateAsync: downloadTranslatedFile, isLoading } = useMutation({
    mutationKey: ['translated'],
    mutationFn: (sub_project_id: string) =>
      apiClient.get(`${endpoints.DOWNLOAD_TRANSLATED}/${sub_project_id}`),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'translatedFile.xml',
        fileType: 'text/xml',
      })
    },
  })
  return {
    isLoading,
    downloadTranslatedFile,
  }
}

// TODO: no idea what the endpoint will be
export const useSubOrderWorkflow = ({ id }: { id?: string }) => {
  const { mutateAsync: startSubOrderWorkflow, isLoading } = useMutation({
    mutationKey: ['order_workflow'],
    mutationFn: () =>
      apiClient.post(`${endpoints.SUB_PROJECTS}/${id}/start-workflow`),
  })

  return {
    startSubOrderWorkflow,
    isLoading,
  }
}

export const useToggleMtEngine = ({
  subProjectId,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: toggleMtEngine, isLoading } = useMutation({
    mutationKey: ['mt_engine', subProjectId],
    mutationFn: async (payload: { mt_enabled: boolean }) =>
      apiClient.put(`${endpoints.MT_ENGINE}/${subProjectId}`, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['suborders', subProjectId] })
    },
  })

  return {
    toggleMtEngine,
    isLoading,
  }
}
