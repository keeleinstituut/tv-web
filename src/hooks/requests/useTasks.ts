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
import { GetTasksPayload, TasksDataType } from 'types/tasks'

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

export const useFetchTask = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<TasksDataType>({
    queryKey: ['task', id],
    queryFn: () => apiClient.get(`${endpoints.TASKS}/${id}`),
    keepPreviousData: true,
  })

  const taskData = data?.data || []
  const task = taskData[0] || {}

  return {
    isLoading,
    isError,
    task,
  }
}

export const useFetchHistoryTasks = (initialFilters?: GetTasksPayload) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<GetTasksPayload>(initialFilters)

  const { isLoading, isError, data } = useQuery<TasksDataType>({
    queryKey: ['tasks', filters],
    queryFn: () => apiClient.get(endpoints.HISTORY_TASKS, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: historyTasks } = data || {}

  return {
    isLoading,
    isError,
    historyTasks,
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
