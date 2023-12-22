import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { filter, find, map } from 'lodash'
import {
  AssignmentType,
  CatVolumePayload,
  ManualVolumePayload,
} from 'types/assignments'
import { SubProjectResponse } from 'types/projects'
import { VolumeValue } from 'types/volumes'

const getNewSubProjectWithAssignment = (
  volume: VolumeValue,
  oldData?: SubProjectResponse
) => {
  const { data: previousData } = oldData || {}
  if (!previousData) return oldData

  const existingAssignment = find(previousData.assignments, {
    id: volume.assignment_id,
  })

  const existingVolume = find(existingAssignment, { id: volume.id })

  const newVolumes = existingVolume
    ? map(existingAssignment?.volumes, (item) => {
        if (item.id === volume.id) {
          return {
            ...item,
            ...volume,
          }
        }
        return item
      })
    : [...(existingAssignment?.volumes || []), volume]

  const newAssignments = map(previousData.assignments, (item) => {
    if (item.id === volume.assignment_id) {
      // TODO: can be removed later
      const hackedVolumeType = volume as VolumeValue & {
        assignment: AssignmentType
      }
      return {
        ...item,
        ...(hackedVolumeType?.assignment || {}),
        volumes: newVolumes,
      }
    }
    return item
  })

  const newData = {
    ...previousData,
    assignments: newAssignments,
  }
  return { data: newData }
}

const getNewSubProjectWithoutVolume = (
  volumeId?: string,
  oldData?: SubProjectResponse
) => {
  const { data: previousData } = oldData || {}
  if (!previousData) return oldData

  const existingAssignment = find(previousData.assignments, (volumes) =>
    find(volumes, { id: volumeId })
  )

  const typedExistingAssignment = existingAssignment as AssignmentType

  const newVolumes = filter(
    typedExistingAssignment?.volumes,
    ({ id }) => id !== volumeId
  )

  const newAssignments = map(previousData.assignments, (item) => {
    if (item.id === typedExistingAssignment?.id) {
      return {
        ...item,
        volumes: newVolumes,
      }
    }
    return item
  })

  const newData = {
    ...previousData,
    assignments: newAssignments,
  }
  return { data: newData }
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
      // TODO: currently not supported by BE
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
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
      // TODO: currently not supported by BE
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
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
      // TODO: currently not supported by BE
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
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
      // TODO: currently not supported by BE
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithAssignment(data, oldData)
      )
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
    onSuccess: (_, { volumeId }) => {
      // TODO: currently not supported by BE
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) =>
          getNewSubProjectWithoutVolume(volumeId, oldData)
      )
      // TODO: remove later
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
