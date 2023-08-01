import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { filter, find, map } from 'lodash'
import { TagsResponse, TagsPayload } from 'types/tags'

export const useFetchTags = () => {
  const { isLoading, isError, data } = useQuery<TagsResponse>({
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
    mutationFn: async (payload: TagsPayload) =>
      apiClient.post(endpoints.CREATE_TAGS, payload),

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['tags'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: TagsResponse) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          const newlyAddedTags = filter(
            data,
            ({ id }) => !find(previousData, { id })
          )
          const newData = [
            ...map(previousData, (tag) => {
              const newTag = find(data, { id: tag.id })
              return newTag || tag
            }),
            ...newlyAddedTags,
          ]

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
