import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import {
  AssignmentPayload,
  AssignmentType,
  VolumePayload,
} from 'types/assignments'
import { SubOrderResponse } from 'types/orders'
import { VolumeValue } from 'types/volumes'

// TODO: not sure what endpoint to use and what data structure to use

export const useAssignmentAddVendor = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentVendor, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.post(`${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`, payload),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['suborders', sub_project_id],
        (oldData?: SubOrderResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData

          const newAssignments = previousData.assignments.map((item) => {
            if (item.id === data.id) {
              return data
            }
            return item
          })

          const newData = {
            ...previousData,
            assignments: newAssignments,
          }
          return { data: newData }
        }
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
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.delete(
        `${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`,
        payload
      ),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['suborders', sub_project_id],
        (oldData?: SubOrderResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData

          const newAssignments = previousData.assignments.map((item) => {
            if (item.id === data.id) {
              return data
            }
            return item
          })

          const newData = {
            ...previousData,
            assignments: newAssignments,
          }
          return { data: newData }
        }
      )
    },
  })

  return {
    deleteAssignmentVendor,
    isLoading,
  }
}

export const useAssignmentAddVolume = ({
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: VolumePayload }) =>
      apiClient.post(`${endpoints.VOLUMES}`, payload),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['suborders', id],
        type: 'active',
      })
    },
  })

  return {
    addAssignmentVolume,
    isLoading,
  }
}

export const useAssignmentRemoveVolume = ({
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: removeAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { volumeId?: string }) =>
      apiClient.delete(`${endpoints.VOLUMES}/${payload.volumeId}`),
    onSuccess: ({ data }: { data: VolumePayload }) => {
      queryClient.refetchQueries({
        queryKey: ['suborders', id],
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
  // const queryClient = useQueryClient()
  const { mutateAsync: updateAssignment, isLoading } = useMutation({
    mutationKey: ['assignments', id],
    mutationFn: (payload: AssignmentPayload) =>
      apiClient.put(`${endpoints.TASKS}/${id}`, payload),
    // TODO: might need to modify the assignment under subOrder: { assignments } in onSuccess
    // onSuccess: ({ data }) => {
    //   queryClient.setQueryData(
    //     ['institutions', id],
    //     // TODO: possibly will start storing all arrays as objects
    //     // if we do, then this should be rewritten
    //     (oldData?: InstitutionsDataType) => {
    //       const { data: previousData } = oldData || {}
    //       if (!previousData) return oldData
    //       const newData = { ...previousData, ...data }
    //       return { data: newData }
    //     }
    //   )
    //   queryClient.refetchQueries({ queryKey: ['institutions'], type: 'active' })
    // },
  })

  return {
    updateAssignment,
    isLoading,
  }
}
