import {
  CompleteTaskPayload,
  ListTask,
  TaskResponse,
  TasksPayloadType,
  TasksResponse,
} from 'types/tasks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'

export const useFetchTasks = (initialFilters?: TasksPayloadType) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<TasksPayloadType>(initialFilters)

  const { isLoading, isError, data } = useQuery<TasksResponse>({
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

export const useCompleteTask = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()

  const { mutateAsync: completeTask, isLoading } = useMutation({
    mutationKey: ['tasks', id],
    mutationFn: (payload: CompleteTaskPayload) =>
      apiClient.post(`${endpoints.TASKS}/${id}`, payload),
    onSuccess: ({ data }: { data: ListTask }) => {
      // TODO: we should update task with this id + we should also update the parent project and possibly sub-project
      // Will see if we get all the relevant info in the response
      queryClient.setQueryData(['tasks', id], (oldData?: TaskResponse) => {
        const { data: previousData } = oldData || {}

        const newData = {
          ...(previousData || {}),
          ...data,
        }
        return { data: newData }
      })
    },
  })
  return {
    completeTask,
    isLoading,
  }
}
