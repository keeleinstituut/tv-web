import { downloadFile as downloadHelper } from 'helpers'
import { useMutation } from '@tanstack/react-query'
import { PotentialFilePayload, SourceFile } from 'types/projects'
import { map } from 'lodash'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'

const useAddFiles = (config: {
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

const useDeleteFile = (config: {
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

const useDeleteBulkFiles = (config: {
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

const useAddBulkFiles = (config: {
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

const useUpdateBulkFiles = (config: {
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

const useDownloadFile = (config: {
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
