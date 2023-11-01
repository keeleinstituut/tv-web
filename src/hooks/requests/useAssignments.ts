import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { forEach, map } from 'lodash'
import {
  AssignmentPayload,
  AssignmentType,
  CatVolumePayload,
  ManualVolumePayload,
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
    mutationFn: (payload: { data: ManualVolumePayload }) =>
      apiClient.post(`${endpoints.VOLUMES}`, payload.data),
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

export const useAssignmentEditVolume = ({
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: editAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: ManualVolumePayload; volumeId: string }) =>
      apiClient.put(`${endpoints.VOLUMES}/${payload.volumeId}`, payload.data),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['suborders', id],
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
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentCatVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: CatVolumePayload }) =>
      apiClient.post(`${endpoints.VOLUMES}/cat-tool`, payload.data),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['suborders', id],
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
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: editAssignmentCatVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { data: CatVolumePayload; volumeId: string }) =>
      apiClient.put(
        `${endpoints.VOLUMES}/cat-tool/${payload.volumeId}`,
        payload.data
      ),
    onSuccess: ({ data }: { data: VolumeValue }) => {
      queryClient.refetchQueries({
        queryKey: ['suborders', id],
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
  subOrderId: id,
}: {
  subOrderId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: removeAssignmentVolume, isLoading } = useMutation({
    mutationKey: ['suborders', id],
    mutationFn: (payload: { volumeId?: string }) =>
      apiClient.delete(`${endpoints.VOLUMES}/${payload.volumeId}`),
    onSuccess: ({ data }: { data: ManualVolumePayload }) => {
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

export const useAddFile = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: string
}) => {
  const { mutateAsync: addFile, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: File[]) => {
      const { reference_object_id, reference_object_type, collection } = config
      // const form = new FormData()

      // forEach(payload, (file, i) => {
      //   form.append(`files[${i}][content]`, file)
      //   form.append(`files[${i}][reference_object_id]`, reference_object_id)
      //   form.append(`files[${i}][reference_object_type]`, reference_object_type)
      //   form.append(`files[${i}][collection]`, collection)
      // })

      // console.log(payload)

      const files = map(payload, (file) => ({
        content: file,
        reference_object_id,
        reference_object_type,
        collection,
      }))

      return apiClient.instance.postForm(endpoints.MEDIA_BULK, {
        files,
      })
    },
  })
  return {
    addFile,
    isLoading,
  }
}

export const useDeleteFile = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: string
}) => {
  const { mutateAsync: deleteFile, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: string) => {
      const { reference_object_id, reference_object_type, collection } = config

      const files =
        //map(payload, (id) => (
        [
          {
            id: payload,
            reference_object_id,
            reference_object_type,
            collection,
          },
        ]
      //))

      return apiClient.delete(endpoints.MEDIA_BULK, {
        files,
      })
    },
  })
  return {
    deleteFile,
    isLoading,
  }
}
