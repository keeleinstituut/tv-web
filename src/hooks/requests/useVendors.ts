import { VendorsDataType } from 'types/vendors'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'

export const useVendorsFetch = () => {
  const { isLoading, isError, data } = useQuery<VendorsDataType>({
    queryKey: ['vendors'],
    queryFn: () => apiClient.get(endpoints.VENDORS),
  })
  const { data: existingVendors, meta: paginationData } = data || {}

  return {
    existingVendors,
    isLoading,
    isError,
    paginationData,
  }
}
