import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { InstitutionsDataType } from 'types/institutions'

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
