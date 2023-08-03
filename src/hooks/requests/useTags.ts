import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { filter, find, includes, keyBy, map, omit, reduce } from 'lodash'
import { TagsResponse, TagsPayload, TagFields } from 'types/tags'

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

export const useBulkUpdate = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateTags, isLoading } = useMutation({
    mutationKey: ['tags'],
    mutationFn: async (payload: TagsPayload) =>
      apiClient.post(endpoints.UPDATE_TAGS, payload),

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['tags'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: TagsResponse) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          console.log('new', data)
          console.log('old', oldData)

          const dataIds = map(data, 'id')

          // const updatedPreviousData = reduce(
          //   previousData,
          //   (result: TagsResponse, item: TagFields) => {
          //     const updatedTagObject = item.id
          //       ? dataMapping[item.id]
          //       : undefined

          //     return updatedTagObject
          //       ? [...result, updatedTagObject]
          //       : [...result, item]
          //   },
          //   []
          // )
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
          // const removeData = filter(
          //   previousData,
          //   ({ id }) => !includes(dataIds, id)
          // )
          // const updatedData = [...removeData, ...data]

          // console.log('!', dataIds, removeData, updatedData)

          // return { data: updatedData }
        }
      )
    },
  })

  return {
    updateTags,
    isLoading,
  }
}
