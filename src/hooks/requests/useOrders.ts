import {
  ListOrder,
  OrderDetail,
  OrdersResponse,
  OrdersPayloadType,
  OrderResponse,
  NewOrderPayload,
} from 'types/orders'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import newMockOrders from './newMockOrders.json'
import singleMockOrder from './singleMockOrder.json'
import useFilters from 'hooks/useFilters'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'

// export const useFetchOrders = () => {
//   const {
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     filters,
//     handleFilterChange,
//     handleSortingChange,
//     handlePaginationChange,
//   } = useFilters<OrdersPayloadType>()

//   const { isLoading, isError, data } = useQuery<OrdersResponse>({
//     queryKey: ['orders'],
//     queryFn: () => {
//       return apiClient.get(`${endpoints.PROJECTS}`)
//     },
//     keepPreviousData: true,
//   })

//   const { meta: paginationData, data: orders } = data || {}

//   return {
//     isLoading,
//     isError,
//     orders,
//     paginationData,
//     handleFilterChange,
//     handleSortingChange,
//     handlePaginationChange,
//   }
// }

// export const useFetchOrder = ({ orderId }: { orderId?: string }) => {
//   const { isLoading, isError, data } = useQuery<OrderResponse>({
//     queryKey: ['orders', orderId],
//     queryFn: () => {
//       return apiClient.get(`${endpoints.PROJECTS}/${orderId}`)
//     },
//   })

//   const { data: order } = data || {}

//   return {
//     isLoading,
//     isError,
//     order,
//   }
// }

export const useFetchOrders = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<OrdersPayloadType>()

  const { isLoading, isError, data } = useQuery<OrdersResponse>({
    queryKey: ['orders'],
    queryFn: () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          // TODO: request will be done with filters
          resolve({
            data: newMockOrders.data as unknown as ListOrder[],
            meta: {
              current_page: 1,
              from: 1,
              last_page: 1,
              per_page: 10,
              to: 10,
              total: 10,
            },
          })
        }, 1000)
      )
    },
    keepPreviousData: true,
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

export const useFetchOrder = ({ orderId }: { orderId?: string }) => {
  const { isLoading, isError, data } = useQuery<OrderResponse>({
    queryKey: ['orders', orderId],
    queryFn: () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          // TODO: replace with request to BE
          resolve({
            data: singleMockOrder as unknown as OrderDetail,
          })
        }, 1000)
      )
    },
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
  const { mutateAsync: createOrder, isLoading } = useMutation({
    mutationKey: ['orders'],
    mutationFn: (payload: NewOrderPayload) =>
      apiClient.post(endpoints.PROJECTS, payload),
    onSuccess: ({ data, meta }) => {
      queryClient.setQueryData(['orders'], (oldData?: OrdersResponse) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
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
export const useFetchSubProject = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<any>({
    queryKey: ['subproject', id],
    queryFn: () => {
      return apiClient.get(`${endpoints.SUBPROJECTS}/${id}`)
    },
  })

  const { data: subProject } = data || {}

  return {
    isLoading,
    isError,
    subProject,
  }
}

export const useSubProjectSendToCat = ({ id }: any) => {
  const { mutateAsync: sendToCat, isLoading } = useMutation({
    mutationKey: ['roles'],
    mutationFn: (payload: any) =>
      apiClient.post(`${endpoints.SUBPROJECTS}/${id}/send-to-cat`, {
        ...payload,
      }),
  })

  return {
    sendToCat,
    isLoading,
  }
}
