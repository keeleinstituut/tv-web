import { apiClient } from 'api'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import useFilters from 'hooks/useFilters'
import { StatisticsParams, StatisticsResponse } from 'types/statistics'

export const useFetchStatistics = (
  initialParams?: StatisticsParams,
  saveQueryParams?: boolean
) => {
  const { filters, handleFilterChange } = useFilters<StatisticsParams>(
    initialParams,
    saveQueryParams,
    { includePage: false }
  )

  const { data, isLoading, isError } = useQuery<StatisticsResponse>({
    queryKey: ['statistics', filters],
    queryFn: () => apiClient.get(endpoints.STATISTICS, filters),
  })

  return {
    rows: data?.data ?? [],
    isLoading,
    isError,
    filters: filters as StatisticsParams,
    handleFilterChange,
  }
}
