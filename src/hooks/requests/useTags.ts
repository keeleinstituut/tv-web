import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { TagsDataType } from 'types/tags'

export const useFetchTags = () => {
  const { isLoading, isError, data } = useQuery<TagsDataType>({
    queryKey: ['tags'],
    queryFn: () => apiClient.get(endpoints.TAGS),
  })

  const { data: tags } = data || {}

  return {
    isLoading,
    isError,
    tags,
  }
}

export const useBulkCreate = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: createTags, isLoading } = useMutation({
    mutationKey: ['tags'],
    mutationFn: async (payload: TagsDataType) => {
      console.log('payload', payload)

      const tagsData = { ...payload }

      console.log('tagsData', tagsData)

      const updatedData = {
        tags: payload.data,
      }
      console.log('updatedData*****', updatedData)

      return apiClient.post(endpoints.CREATE_TAGS, {
        updatedData,
      })
    },

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['tags'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: TagsDataType) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          const newData = { ...oldData, ...data }

          return { data: newData }
        }
      )
    },
  })

  return {
    createTags,
    isLoading,
  }
}
