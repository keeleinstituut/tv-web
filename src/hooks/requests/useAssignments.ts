import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { map, find, filter } from 'lodash'
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

const getNewSubProjectWithOutAssignment = (
  assignmentId: string,
  oldData?: SubProjectResponse
) => {
  const { data: previousData } = oldData || {}
  if (!previousData) return oldData

  const newAssignments = filter(
    previousData.assignments,
    ({ id }) => id !== assignmentId
  )

  const newData = {
    ...previousData,
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
    linkCatToolJobs,
    isLoading,
  }
}

export const useDeleteAssignment = ({
  sub_project_id,
}: {
  sub_project_id: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteAssignment, isLoading } = useMutation({
    mutationKey: ['assignments'],
    mutationFn: async (id: string) =>
      apiClient.delete(`${endpoints.ASSIGNMENTS}/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithOutAssignment(id, oldData)
      )
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
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
    },
  })
  return {
    completeAssignment,
    isLoading,
  }
}
