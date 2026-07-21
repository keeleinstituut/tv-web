import { pick } from 'lodash'
import { apiClient } from 'api'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import useFilters from 'hooks/useFilters'
import { StatisticsFilters, StatisticsResponse } from 'types/statistics'

const SERVER_KEYS = ['type', 'timeframe', 'basis'] as const

export const useFetchStatistics = (
  initialParams?: StatisticsFilters,
  saveQueryParams?: boolean
) => {
  const { filters, handleFilterChange, handleSortingChange } =
    useFilters<StatisticsFilters>(initialParams, saveQueryParams, {
      includePage: false,
    })

  const serverParams = pick(filters as StatisticsFilters, SERVER_KEYS)

  const { data, isLoading, isError } = useQuery<StatisticsResponse>({
    queryKey: ['statistics', serverParams],
    queryFn: () => apiClient.get(endpoints.STATISTICS, serverParams),
  })

  return {
    rows: data?.data ?? [],
    isLoading,
    isError,
    filters: filters as StatisticsFilters,
    handleFilterChange,
    handleSortingChange,
  }
}
