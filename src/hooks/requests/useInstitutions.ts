import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import {
  InstitutionDataType,
  InstitutionPostType,
  InstitutionsDataType,
} from 'types/institutions'

export const useInstitutionsFetch = () => {
  const { isLoading, isError, data } = useQuery<InstitutionsDataType>({
    queryKey: ['institutions'],
    queryFn: () => apiClient.get(endpoints.INSTITUTIONS),
  })

  const { data: institutions } = data || {}

  return {
    institutions,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useInstitutionFetch = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<InstitutionDataType>({
    enabled: !!id,
    queryKey: ['institutions', id],
    queryFn: () => apiClient.get(`${endpoints.INSTITUTIONS}/${id}`),
  })
  const { data: institution } = data || {}

  return {
    institution,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useInstitutionUpdate = ({ id }: { id?: string | undefined }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitution, isLoading } = useMutation({
    mutationKey: ['institutions', id],
    mutationFn: (payload: InstitutionPostType) =>
      apiClient.put(`${endpoints.INSTITUTIONS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['institutions', id],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: InstitutionsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({ queryKey: ['institutions'], type: 'active' })
    },
  })

  return {
    updateInstitution,
    isLoading,
  }
}
