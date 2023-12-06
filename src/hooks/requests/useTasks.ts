import {
  CompleteTaskPayload,
  ListTask,
  TaskResponse,
  TaskType,
  TasksPayloadType,
  TasksResponse,
} from 'types/tasks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { useParams } from 'react-router-dom'

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
    filters,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchTask = ({ id }: { id?: string }) => {
  const { isHistoryView } = useParams()
  const { isLoading, isError, data } = useQuery<TaskResponse>({
    enabled: !!id && !isHistoryView,
    queryKey: ['tasks', id],
    queryFn: () => apiClient.get(`${endpoints.TASKS}/${id}`),
    keepPreviousData: true,
  })

  const { data: task } = data || {}

  return {
    isLoading,
    isError,
    task,
  }
}

export const useFetchHistoryTasks = (initialFilters?: TasksPayloadType) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<TasksPayloadType>(initialFilters)

  const { isLoading, isError, data } = useQuery<TasksResponse>({
    queryKey: ['historyTasks', filters],
    queryFn: () => apiClient.get(endpoints.HISTORY_TASKS, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: historyTasks } = data || {}

  return {
    isLoading,
    isError,
    filters,
    historyTasks,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchHistoryTask = ({ id }: { id?: string }) => {
  const { isHistoryView } = useParams()
  const { isLoading, isError, data } = useQuery<TaskResponse>({
    enabled: !!id && !!isHistoryView,
    queryKey: ['historyTasks', id],
    queryFn: () => apiClient.get(`${endpoints.HISTORY_TASKS}/${id}`),
    keepPreviousData: true,
  })

  const { data: historyTask } = data || {}

  return {
    isLoading,
    isError,
    historyTask,
  }
}

export const useCompleteTask = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()

  const { mutateAsync: completeTask, isLoading } = useMutation({
    mutationKey: ['tasks', id],
    mutationFn: (payload: CompleteTaskPayload) =>
      apiClient.instance.postForm(`${endpoints.TASKS}/${id}/complete`, payload),
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

      // TODO: might be able to get rid of this
      if (
        data?.task_type === TaskType.ClientReview ||
        data?.task_type === TaskType.Correcting
      ) {
        queryClient.refetchQueries({ queryKey: ['projects', data?.project_id] })
      }
    },
  })
  return {
    completeTask,
    isLoading,
  }
}

export const useAcceptTask = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()

  const { mutateAsync: acceptTask, isLoading } = useMutation({
    mutationKey: ['tasks', id],
    mutationFn: () => apiClient.post(`${endpoints.TASKS}/${id}/accept`),
    onSuccess: ({ data }: { data: ListTask }) => {
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
    acceptTask,
    isLoading,
  }
}

export const useTaskCache = (id?: string): ListTask | undefined => {
  const { isHistoryView } = useParams()
  const queryClient = useQueryClient()
  const taskCache: { data: ListTask } | undefined = queryClient.getQueryData([
    isHistoryView ? 'historyTasks' : 'tasks',
    id,
  ])
  const task = taskCache?.data

  return task
}
