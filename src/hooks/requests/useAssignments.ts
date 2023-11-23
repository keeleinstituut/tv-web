import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { map, find } from 'lodash'
import {
  AssignmentPayload,
  AssignmentType,
  CatVolumePayload,
  CompleteAssignmentPayload,
  ManualVolumePayload,
} from 'types/assignments'
import { SplitProjectPayload, SubProjectResponse } from 'types/projects'
import { VolumeValue } from 'types/volumes'

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

export const useAssignmentAddVolume = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: ManualVolumePayload }) =>
      apiClient.post(`${endpoints.VOLUMES}`, payload.data),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['subprojects', id],
        type: 'active',
      })
    },
  })

  return {
    addAssignmentVolume,
    isLoading,
  }
}

export const useAssignmentEditVolume = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: editAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: ManualVolumePayload; volumeId: string }) =>
      apiClient.put(`${endpoints.VOLUMES}/${payload.volumeId}`, payload.data),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['subprojects', id],
        type: 'active',
      })
    },
  })

  return {
    editAssignmentVolume,
    isLoading,
  }
}

export const useAssignmentAddCatVolume = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentCatVolume, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: CatVolumePayload }) =>
      apiClient.post(`${endpoints.VOLUMES}/cat-tool`, payload.data),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['subprojects', id],
        type: 'active',
      })
    },
  })

  return {
    addAssignmentCatVolume,
    isLoading,
  }
}

export const useAssignmentEditCatVolume = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: editAssignmentCatVolume, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: CatVolumePayload; volumeId: string }) =>
      apiClient.put(
        `${endpoints.VOLUMES}/cat-tool/${payload.volumeId}`,
        payload.data
      ),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['subprojects', id],
        type: 'active',
      })
    },
  })

  return {
    editAssignmentCatVolume,
    isLoading,
  }
}

export const useAssignmentRemoveVolume = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: removeAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { volumeId?: string }) =>
      apiClient.delete(`${endpoints.VOLUMES}/${payload.volumeId}`),
    onSuccess: ({ data }: { data: ManualVolumePayload }) => {
      queryClient.refetchQueries({
        queryKey: ['subprojects', id],
        type: 'active',
      })
    },
  })

  return {
    removeAssignmentVolume,
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
    onSuccess: () => {
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
    onSuccess: () => {
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
      // TODO: we should update task with this id + we should also update the parent project and possibly sub-project
      // Will see if we get all the relevant info in the response
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
