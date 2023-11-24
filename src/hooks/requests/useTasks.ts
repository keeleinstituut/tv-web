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

export const useFetchTask = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<TaskResponse>({
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

export const useFetchHistoryTask = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<TaskResponse>({
    queryKey: ['tasks', id],
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
        data?.task_type === 'CLIENT_REVIEW' ||
        data?.task_type === 'CORRECTING'
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
    onSuccess: ({ data }: { data: any }) => {
      queryClient.setQueryData(['tasks', id], (oldData?: any) => {
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

export const useCompleteAssignment = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()

  const { mutateAsync: completeAssignment, isLoading } = useMutation({
    mutationKey: ['tasks', id],
    mutationFn: () => apiClient.post(`${endpoints.TASKS}/${id}/complete`),
    onSuccess: ({ data }: { data: any }) => {
      queryClient.setQueryData(['tasks', id], (oldData?: any) => {
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
    completeAssignment,
    isLoading,
  }
}
