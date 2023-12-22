import { downloadFile as downloadHelper } from 'helpers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PotentialFilePayload,
  SourceFile,
  SubProjectResponse,
} from 'types/projects'
import { TaskResponse } from 'types/tasks'
import { filter, find, map } from 'lodash'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'

// TODO: should type config

export enum CollectionType {
  Final = 'final',
  Source = 'source',
  Help = 'help',
}

const filesKeys: Record<string, 'final_files' | 'source_files'> = {
  [CollectionType.Final]: 'final_files',
  [CollectionType.Source]: 'source_files',
}

const useAddFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: CollectionType
  taskId?: string
}) => {
  const queryClient = useQueryClient()
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
    onSuccess: ({ data: { data } }: { data: { data: SourceFile[] } }) => {
      const { reference_object_id, reference_object_type, collection, taskId } =
        config
      if (
        reference_object_type === 'subproject' &&
        collection !== CollectionType.Help
      ) {
        const filesKey = filesKeys[collection]
        queryClient.setQueryData(
          ['subprojects', reference_object_id],
          (oldData?: SubProjectResponse) => {
            const { data: previousData } = oldData || {}
            if (!previousData) return oldData
            const newData = {
              ...previousData,
              [filesKey]: [...previousData[filesKey], ...data],
            }
            return {
              data: newData,
            }
          }
        )
        if (taskId) {
          queryClient.setQueryData(
            ['tasks', taskId],
            (oldData?: TaskResponse) => {
              const { data: previousData } = oldData || {}

              if (!previousData) return oldData

              const previousAssignment = previousData?.assignment || {}

              const newData = {
                ...(previousData || { id: taskId }),
                assignment: {
                  ...previousAssignment,
                  subProject: {
                    ...(previousAssignment?.subProject || {}),
                    [filesKey]: [
                      ...(previousAssignment?.subProject?.[filesKey] || []),
                      ...data,
                    ],
                  },
                },
              }
              return { data: newData }
            }
          )
        }
      }
    },
  })
  return {
    addFiles,
    isLoading,
  }
}

const useDeleteFile = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: CollectionType
  taskId?: string
}) => {
  const queryClient = useQueryClient()
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
    onSuccess: ({ data }: { data: SourceFile[] }) => {
      const { reference_object_id, reference_object_type, collection, taskId } =
        config
      if (
        reference_object_type === 'subproject' &&
        collection !== CollectionType.Help
      ) {
        const filesKey = filesKeys[collection]
        queryClient.setQueryData(
          ['subprojects', reference_object_id],
          (oldData?: SubProjectResponse) => {
            const { data: previousData } = oldData || {}
            if (!previousData) return oldData
            return {
              data: {
                ...previousData,
                [filesKey]: filter(
                  previousData[filesKey],
                  ({ id }) => !find(data, { id })
                ),
              },
            }
          }
        )
        if (taskId) {
          queryClient.setQueryData(
            ['tasks', taskId],
            (oldData?: TaskResponse) => {
              const { data: previousData } = oldData || {}

              if (!previousData) return oldData

              const previousAssignment = previousData?.assignment || {}

              const newData = {
                ...(previousData || { id: taskId }),
                assignment: {
                  ...previousAssignment,
                  subProject: {
                    ...(previousData?.subProject || {}),
                    [filesKey]: filter(
                      previousAssignment?.subProject?.[filesKey],
                      ({ id }) => !find(data, { id })
                    ),
                  },
                },
              }
              return { data: newData }
            }
          )
        }
      }
    },
  })
  return {
    deleteFile,
    isLoading,
  }
}

const useDeleteBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: CollectionType
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

const useAddBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: CollectionType
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

const useUpdateBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: CollectionType
}) => {
  const { mutateAsync: updateBulkFiles, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: PotentialFilePayload[]) =>
      Promise.allSettled(
        map(payload, ({ file, help_file_type }) =>
          apiClient.instance.put(
            `${endpoints.MEDIA}/${(file as SourceFile)?.id}`,
            {
              help_file_type,
            }
          )
        )
      ),
  })
  return {
    updateBulkFiles,
    isLoading,
  }
}

const useDownloadFile = (config: {
  reference_object_id: string
  reference_object_type: string
  collection: CollectionType
}) => {
  const { mutateAsync: downloadFile, isLoading } = useMutation({
    mutationKey: ['files', config.reference_object_id],
    mutationFn: (payload: SourceFile & { collection?: CollectionType }) => {
      const { reference_object_id, reference_object_type, collection } = config

      const file = {
        id: payload.id,
        reference_object_id,
        reference_object_type,
        collection: payload?.collection || collection,
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
  collection: CollectionType
  taskId?: string
}) => {
  const { collection, reference_object_id, reference_object_type, taskId } =
    config
  const { addFiles, isLoading: isAddLoading } = useAddFiles({
    reference_object_id,
    reference_object_type,
    collection,
    taskId,
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
    taskId,
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

export const useHandleBulkFiles = (config: {
  reference_object_id: string
  reference_object_type: string
  collection?: CollectionType
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
