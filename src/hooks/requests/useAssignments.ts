import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { map, find } from 'lodash'
import {
  AssignmentPayload,
  AssignmentType,
  CompleteAssignmentPayload,
} from 'types/assignments'
import { SplitProjectPayload, SubProjectResponse } from 'types/projects'

const getNewSubProjectWithAssignment = (
  assignment: AssignmentType,
  oldData?: SubProjectResponse
) => {
  const { data: previousData } = oldData || {}
  if (!previousData) return oldData

  const existingAssignment = find(previousData.assignments, {
    id: assignment.id,
  })

  const newAssignments = existingAssignment
    ? map(previousData.assignments, (item) => {
        if (item.id === assignment.id) {
          return assignment
        }
        return item
      })
    : [...previousData.assignments, assignment]

  const newData = {
    ...previousData,
    ...(assignment?.subProject || {}),
    assignments: newAssignments,
  }
  return { data: newData }
}

// TODO: not sure what endpoint to use and what data structure to use

export const useAssignmentAddVendor = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentVendor, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.post(`${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`, payload),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
    },
  })

  return {
    addAssignmentVendor,
    isLoading,
  }
}

export const useAssignmentRemoveVendor = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteAssignmentVendor, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.delete(
        `${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`,
        payload
      ),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
    },
  })

  return {
    deleteAssignmentVendor,
    isLoading,
  }
}

export const useAssignmentUpdate = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateAssignment, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: AssignmentPayload) =>
      apiClient.put(`${endpoints.ASSIGNMENTS}/${id}`, payload),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
    },
  })

  return {
    updateAssignment,
    isLoading,
  }
}

export const useSplitAssignment = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: splitAssignment, isLoading } = useMutation({
    mutationKey: ['assignments'],
    mutationFn: (payload: SplitProjectPayload) =>
      apiClient.post(endpoints.ASSIGNMENTS, {
        ...payload,
      }),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
    },
  })

  return {
    splitAssignment,
    isLoading,
  }
}

export const useLinkCatToolJobs = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: linkCatToolJobs, isLoading } = useMutation({
    mutationKey: ['link_cat_tool_jobs'],
    mutationFn: (payload: {
      linking: {
        cat_tool_job_id: string
        assignment_id: string
      }[]
      job_key: string
      sub_project_id: string
    }) =>
      apiClient.post(endpoints.LINK_CAT_TOOL_JOBS, {
        ...payload,
      }),
    onSuccess: (data) => {
      console.warn('linking cat tools', data)
      queryClient.refetchQueries({ queryKey: ['assignments'] })
    },
  })

  return {
    linkCatToolJobs,
    isLoading,
  }
}

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteAssignment, isLoading } = useMutation({
    mutationKey: ['subprojects'],
    mutationFn: async (payload: string) =>
      apiClient.delete(`${endpoints.ASSIGNMENTS}/${payload}`),
    onSuccess: (data) => {
      console.warn('deleting assignment', data)
      queryClient.refetchQueries({
        queryKey: ['subprojects'],
        type: 'active',
      })
    },
  })

  return {
    deleteAssignment,
    isLoading,
  }
}

export const useCompleteAssignment = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: completeAssignment, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload?: CompleteAssignmentPayload) =>
      apiClient.post(
        `${endpoints.ASSIGNMENTS}/${id}/mark-as-completed`,
        payload
      ),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      // For now we have to use refetching
      // We can skip this, once BE responds with new subProject (currently old one is sent)
      // And the changes to other assignments should also be returned from BE, which currently are not
      // queryClient.setQueryData(
      //   ['subprojects', sub_project_id],
      //   (oldData?: SubProjectResponse) =>
      //     getNewSubProjectWithAssignment(data, oldData)
      // )
      queryClient.refetchQueries({
        queryKey: ['subprojects', sub_project_id],
      })
    },
  })
  return {
    completeAssignment,
    isLoading,
  }
}
