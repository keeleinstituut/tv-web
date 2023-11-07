import {
  ListOrder,
  DetailedOrder,
  OrdersResponse,
  OrdersPayloadType,
  OrderResponse,
} from 'types/orders'
import { useMutation, useQuery } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'

export const useFetchTasks = (initialFilters?: any) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<any>(initialFilters)

  const { isLoading, isError, data } = useQuery<any>({
    queryKey: ['tasks', filters],
    queryFn: () => apiClient.get(endpoints.TASKS, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: tasks } = data || {}

  return {
    isLoading,
    isError,
    tasks,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

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

// export const useFetchSubProject = ({ id }: { id?: string }) => {
//   const { isLoading, isError, data } = useQuery<any>({
//     queryKey: ['subproject', id],
//     queryFn: () => {
//       return apiClient.get(`${endpoints.SUB_PROJECTS}/${id}`)
//     },
//   })

//   const { data: subProject } = data || {}

//   return {
//     isLoading,
//     isError,
//     subProject,
//   }
// }

// export const useSubProjectSendToCat = ({ id }: any) => {
//   const { mutateAsync: sendToCat, isLoading } = useMutation({
//     mutationKey: ['roles'],
//     mutationFn: (payload: any) =>
//       apiClient.post(`${endpoints.SUB_PROJECTS}/${id}/send-to-cat`, {
//         ...payload,
//       }),
//   })

//   return {
//     sendToCat,
//     isLoading,
//   }
// }
