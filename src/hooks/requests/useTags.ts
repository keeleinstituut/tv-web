import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { TagsDataType, TagsType } from 'types/tags'

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
    mutationFn: async (payload: TagsType) => {
      return apiClient.post(endpoints.CREATE_TAGS, payload)
    },

    onSuccess: ({ tags }) => {
      queryClient.setQueryData(
        ['tags'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: TagsType) => {
          const { tags: previousData } = oldData || {}

          if (!previousData) return oldData
          const newData = { ...oldData, ...tags }

          return { tags: newData }
        }
      )
    },
  })

  return {
    createTags,
    isLoading,
  }
}
