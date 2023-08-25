import {
  ListOrder,
  DetailedOrder,
  OrdersResponse,
  OrdersPayloadType,
  OrderResponse,
  NewOrderPayload,
  SubOrdersResponse,
  SubOrderResponse,
  SubOrdersPayloadType,
  ListSubOrderDetail,
  SubOrderDetail,
  CatProjectPayload,
} from 'types/orders'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import newMockOrders from './newMockOrders.json'
import newSubOrders from './newSubOrders.json'
import mockSubOrder from './mockSubOrder.json'
import singleMockOrder from './singleMockOrder.json'
import useFilters from 'hooks/useFilters'
import { findIndex } from 'lodash'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'

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
      // return apiClient.get(`${endpoints.PROJECTS}`, filters)
      // TODO: dummyData for now, replace with the line above
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
        }, 150)
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
      // return apiClient.get(`${endpoints.PROJECTS}/${orderId}`)
      // TODO: dummy data for now, replace with the line above, once BE is implemented
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: singleMockOrder as unknown as DetailedOrder,
          })
        }, 150)
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

export const useUpdateOrder = ({ orderId }: { orderId?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateOrder, isLoading } = useMutation({
    mutationKey: ['orders', orderId],
    mutationFn: (payload: NewOrderPayload) =>
      apiClient.put(`${endpoints.PROJECTS}/${orderId}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['orders'], (oldData?: OrdersResponse) => {
        const { data: previousData, meta } = oldData || {}
        if (!previousData || !meta) return oldData
        const orderIndex = findIndex(previousData, { id: orderId })
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

export const useFetchSubOrder = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<SubOrderResponse>({
    queryKey: ['suborders', id],
    queryFn: () => {
      // return apiClient.get(`${endpoints.SUB_PROJECTS}/${id}`)
      // TODO: dummy data for now, replace with the line above, once BE is implemented
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: mockSubOrder as unknown as SubOrderDetail,
          })
        }, 150)
      )
    },
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
    queryKey: ['suborders'],
    queryFn: () => {
      // return apiClient.get(`${endpoints.SUB_PROJECTS}`, filters)
      // TODO: dummyData for now, replace with the line above
      return new Promise((resolve) =>
        setTimeout(() => {
          // TODO: request will be done with filters
          resolve({
            data: newSubOrders.data as unknown as ListSubOrderDetail[],
            meta: {
              current_page: 1,
              from: 1,
              last_page: 1,
              per_page: 10,
              to: 10,
              total: 10,
            },
          })
        }, 150)
      )
    },
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

export const useSubOrderSendToCat = ({ id }: { id?: string }) => {
  const { mutateAsync: sendToCat, isLoading } = useMutation({
    mutationKey: ['roles'],
    mutationFn: (payload: CatProjectPayload) =>
      apiClient.post(`${endpoints.SUB_PROJECTS}/${id}/send-to-cat`, {
        ...payload,
      }),
  })

  return {
    sendToCat,
    isLoading,
  }
}
