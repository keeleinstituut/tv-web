import { OrderType, OrdersDataType, OrdersPayloadType } from 'types/orders'
import { useQuery } from '@tanstack/react-query'
import mockOrders from './mockOrder.json'
import useFilters from 'hooks/useFilters'

export const useFetchOrders = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<OrdersPayloadType>()

  const { isLoading, isError, data } = useQuery<OrdersDataType>({
    queryKey: ['orders'],
    queryFn: () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          // TODO: request will be done with filters
          resolve({
            data: mockOrders.data as unknown as OrderType[],
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
