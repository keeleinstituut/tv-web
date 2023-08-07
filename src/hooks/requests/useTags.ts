import { apiClient } from 'api'
import { filter, find, map } from 'lodash'
import {
  TagsResponse,
  TagsPayload,
  TagsUpdatePayloadType,
  TagTypes,
} from 'types/tags'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'

export const useFetchTags = () => {
  const {
    isLoading,
    isError,
    data: TagsData,
  } = useQuery<TagsResponse>({
    queryKey: ['tags'],
    queryFn: () => apiClient.get(endpoints.TAGS),
  })

  const { data: tags } = TagsData || {}

  const tagsFilters = map(tags, ({ id, name }) => {
    return { value: id, label: name }
  })

  return {
    tags,
    isLoading: isLoading,
    isError: isError,
    tagsFilters,
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

export const useBulkUpdate = ({ type }: { type: TagTypes }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateTags, isLoading } = useMutation({
    mutationKey: ['tags'],
    mutationFn: async (payload: TagsUpdatePayloadType) =>
      apiClient.post(endpoints.UPDATE_TAGS, payload),

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['tags'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: TagsResponse) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData

          const otherTypeData = filter(
            previousData,
            (data) => data.type !== type
          )
          const newData = [...otherTypeData, ...data]

          return { data: newData }
        }
      )
    },
  })

  return {
    updateTags,
    isLoading,
  }
}
