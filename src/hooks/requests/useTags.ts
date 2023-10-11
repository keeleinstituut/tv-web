import { apiClient } from 'api'
import { filter, find, map, isEmpty } from 'lodash'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { TagsResponse, GetTagsPayload, TagsPayload, TagTypes } from 'types/tags'
import useFilters from 'hooks/useFilters'

export const useFetchTags = (initialFilters?: GetTagsPayload) => {
  const { filters } = useFilters<GetTagsPayload>(initialFilters)

  const {
    isLoading,
    isError,
    data: TagsData,
  } = useQuery<TagsResponse>({
    queryKey: isEmpty(filters) ? ['tags'] : ['tags', filters],
    queryFn: () => apiClient.get(endpoints.TAGS, filters),
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
export const useFetchSkills = () => {
  const { data } = useQuery<TagsResponse>({
    queryKey: ['skills'],
    queryFn: () => apiClient.get(endpoints.SKILLS),
  })

  return {
    skills: { [TagTypes.Skills]: data?.data },
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
