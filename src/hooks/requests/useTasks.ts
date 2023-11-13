import { useQuery } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { GetTasksPayload, TasksDataType } from 'types/tasks'

export const useFetchTasks = (initialFilters?: GetTasksPayload) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<GetTasksPayload>(initialFilters)

  const { isLoading, isError, data } = useQuery<TasksDataType>({
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
