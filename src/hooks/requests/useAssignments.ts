import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile as downloadHelper } from 'helpers'
import { map } from 'lodash'
import {
  AssignmentPayload,
  AssignmentType,
  CatVolumePayload,
  ManualVolumePayload,
} from 'types/assignments'
import {
  PotentialFilePayload,
  SourceFile,
  SplitProjectPayload,
  SubProjectResponse,
} from 'types/projects'
import { VolumeValue } from 'types/volumes'

// TODO: not sure what endpoint to use and what data structure to use

export const useAssignmentAddVendor = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: addAssignmentVendor, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.post(`${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`, payload),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) => {
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
    mutationKey: ['subprojects', id],
    mutationFn: (payload: { data: AssignmentPayload[] }) =>
      apiClient.delete(
        `${endpoints.ASSIGNMENTS}/${id}/candidates/bulk`,
        payload
      ),
    onSuccess: ({ data }: { data: AssignmentType }) => {
      const { sub_project_id } = data
      queryClient.setQueryData(
        ['subprojects', sub_project_id],
        (oldData?: SubProjectResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData

          const newAssignments = map(previousData.assignments, (item) => {
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
    mutationKey: ['subprojects', id],
    mutationFn: (payload: AssignmentPayload) =>
      apiClient.put(`${endpoints.ASSIGNMENTS}/${id}`, payload),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ['subprojects'],
        type: 'active',
      })
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
    mutationKey: ['split_assignment'],
    mutationFn: (payload: SplitProjectPayload) =>
      apiClient.post(endpoints.ASSIGNMENTS, {
        ...payload,
      }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['subprojects'] })
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

export const useAddFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: string
}) => {
  const { mutateAsync: addFiles, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: File[]) => {
      const { reference_object_id, reference_object_type, collection } = config
      // const form = new FormData()

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
    addFiles,
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

export const useDeleteBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: string
}) => {
  const { mutateAsync: deleteBulkFiles, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: PotentialFilePayload[]) => {
      const { reference_object_id, reference_object_type, collection } = config

      const files = map(payload, ({ file, ...rest }) => ({
        collection,
        id: (file as SourceFile)?.id,
        reference_object_id,
        reference_object_type,
        ...rest,
      }))

      return apiClient.delete(endpoints.MEDIA_BULK, {
        files,
      })
    },
  })
  return {
    deleteBulkFiles,
    isLoading,
  }
}

export const useAddBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: string
}) => {
  const { mutateAsync: addBulkFiles, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: PotentialFilePayload[]) => {
      const { reference_object_id, reference_object_type, collection } = config

      const files = map(payload, ({ file, ...rest }) => ({
        collection,
        content: file,
        reference_object_id,
        reference_object_type,
        ...rest,
      }))

      return apiClient.instance.postForm(endpoints.MEDIA_BULK, {
        files,
      })
    },
  })
  return {
    addBulkFiles,
    isLoading,
  }
}

export const useUpdateBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: string
}) => {
  const { mutateAsync: updateBulkFiles, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: PotentialFilePayload[]) => {
      const { reference_object_id, reference_object_type, collection } = config

      const files = map(payload, ({ file, ...rest }) => ({
        collection,
        content: file,
        reference_object_id,
        reference_object_type,
        ...rest,
      }))

      return apiClient.instance.putForm(endpoints.MEDIA_BULK, {
        files,
      })
    },
  })
  return {
    updateBulkFiles,
    isLoading,
  }
}

export const useDownloadFile = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: string
}) => {
  const { mutateAsync: downloadFile, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: SourceFile) => {
      const { reference_object_id, reference_object_type, collection } = config

      const file = {
        id: payload.id,
        reference_object_id,
        reference_object_type,
        collection,
      }

      return apiClient.get(
        endpoints.MEDIA_DOWNLOAD,
        {
          ...file,
        },
        { responseType: 'blob' }
      )
    },
    onSuccess: (data, { file_name }) => {
      downloadHelper({
        data,
        fileName: file_name,
      })
    },
  })
  return {
    downloadFile,
    isLoading,
  }
}

export const useHandleFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: string
}) => {
  const { collection, reference_object_id, reference_object_type } = config
  const { addFiles, isLoading: isAddLoading } = useAddFiles({
    reference_object_id,
    reference_object_type,
    collection,
  })
  const { downloadFile, isLoading: isDownloadLoading } = useDownloadFile({
    reference_object_id,
    reference_object_type,
    collection,
  })
  const { deleteFile, isLoading: isDeleteLoading } = useDeleteFile({
    reference_object_id,
    reference_object_type,
    collection,
  })

  return {
    addFiles,
    downloadFile,
    deleteFile,
    isAddLoading,
    isDeleteLoading,
    isDownloadLoading,
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
// TODO: should be unified with useHandleFiles, but skipping for now to save time
export const useHandleBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: string
}) => {
  const { collection, reference_object_id, reference_object_type } = config

  const { addBulkFiles, isLoading: isAddLoading } = useAddBulkFiles({
    reference_object_id,
    reference_object_type,
    collection,
  })

  const { deleteBulkFiles, isLoading: isDeleteLoading } = useDeleteBulkFiles({
    reference_object_id,
    reference_object_type,
    collection,
  })

  const { updateBulkFiles, isLoading: isUpdateLoading } = useUpdateBulkFiles({
    reference_object_id,
    reference_object_type,
    collection,
  })

  return {
    addBulkFiles,
    deleteBulkFiles,
    isAddLoading,
    isDeleteLoading,
    updateBulkFiles,
    isUpdateLoading,
  }
}
