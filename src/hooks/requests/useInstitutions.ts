import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { InstitutionsDataType } from 'types/institutions'

interface InstitutionFetchParams {
  disabled?: boolean
}

export const useInstitutionsFetch = (props?: InstitutionFetchParams) => {
  const { disabled } = props || {}
  const { isLoading, isError, data } = useQuery<InstitutionsDataType>({
    queryKey: ['institutions'],
    queryFn: () => apiClient.get(endpoints.INSTITUTIONS),
    enabled: !disabled,
  })

  const { data: institutions } = data || {}

  return {
    institutions,
    isLoading: isLoading,
    isError: isError,
  }
}
