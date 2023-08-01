import {
  ListOrder,
  OrderDetail,
  OrdersResponse,
  OrdersPayloadType,
  OrderResponse,
} from 'types/orders'
import { useQuery } from '@tanstack/react-query'
import newMockOrders from './newMockOrders.json'
import singleMockOrder from './singleMockOrder.json'
import useFilters from 'hooks/useFilters'

export const useFetchOrders = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handelFilterChange,
    handelSortingChange,
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
    handelFilterChange,
    handelSortingChange,
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
