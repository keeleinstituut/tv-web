import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { map, find, filter, isArray, isEmpty } from 'lodash'
import {
  AssigneeCommentPayload,
  AssignmentPayload,
  AssignmentStatus,
  AssignmentType,
  CompleteAssignmentPayload,
} from 'types/assignments'
import {
  ProjectsResponse,
  SplitProjectPayload,
  SubProjectDetail,
  SubProjectResponse,
} from 'types/projects'

const getNewSubProjectWithAssignment = (
  assignments: AssignmentType | AssignmentType[],
  oldData?: SubProjectResponse
) => {
  const { data: previousData } = oldData || {}
  if (!previousData) return oldData
  const allModifiedAssignments = isArray(assignments)
    ? assignments
    : [assignments]

  const allNewAssignment =
    filter(
      allModifiedAssignments,
      ({ id }) => !find(previousData.assignments, { id })
    ) || []

  const modifiedAssignmentsList = map(
    previousData.assignments,
    (assignment) => {
      const modifiedAssignment = find(allModifiedAssignments, {
        id: assignment.id,
      })
      if (!modifiedAssignment) {
        return assignment
      }
      return {
        ...assignment,
        ...modifiedAssignment,
      }
    }
  )

  const newAssignmentsList = [...modifiedAssignmentsList, ...allNewAssignment]

  const active_job_definition = isEmpty(modifiedAssignmentsList)
    ? undefined
    : allModifiedAssignments[0]?.subProject?.active_job_definition

  const newData = {
    ...previousData,
    ...(allModifiedAssignments?.[0]?.subProject || {}),
    assignments: active_job_definition
      ? map(newAssignmentsList, (assignment) => {
          if (assignment?.job_definition?.id !== active_job_definition?.id)
            return assignment
          return {
            ...assignment,
            status: AssignmentStatus.InProgress,
          }
        })
      : newAssignmentsList,
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

export const useAssignmentCommentUpdate = ({ id }: { id?: string }) => {
  const { mutateAsync: updateAssigneeComment, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: AssigneeCommentPayload) =>
      apiClient.put(`${endpoints.ASSIGNMENTS}/${id}/assignee-comment`, payload),
  })

  return {
    updateAssigneeComment,
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
    onSuccess: ({ data }: { data: AssignmentType[] }) => {
      const { sub_project_id } = data?.[0] || {}
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
      // TODO: might need to still do the refetch, since the next assignment won't be "IN_PROGRESS" otherwise
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
      const changesToProject = data?.subProject?.project
      if (changesToProject) {
        // Only storing new status right now, to avoid issues, where some fields can have some missing details in this response
        queryClient.setQueryData(
          ['projects', changesToProject.id],
          (oldData?: ProjectsResponse) => {
            const { data: previousData } = oldData || {}

            if (!previousData) return oldData
            const newData = { ...previousData, status: changesToProject.status }
            return { data: newData }
          }
        )
      }
    },
  })
  return {
    completeAssignment,
    isLoading,
  }
}

export const useAssignmentCache = ({
  id,
  sub_project_id,
}: {
  id: string
  sub_project_id: string
}) => {
  const queryClient = useQueryClient()
  const subProjectCache: { data: SubProjectDetail } | undefined =
    queryClient.getQueryData(['subprojects', sub_project_id])
  const subProject = subProjectCache?.data
  const assignment = find(subProject?.assignments, { id })

  return assignment
}
